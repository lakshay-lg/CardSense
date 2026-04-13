const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Safely parse Claude's JSON response, stripping accidental markdown fences.
 * Returns parsed object or throws if unparseable.
 */
function parseClaudeJSON(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Wraps a Claude API call with a 10-second timeout.
 * Azure App Service B1 has tight egress limits — bail early rather than hang.
 */
async function withTimeout(promise, ms = 30000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Claude API timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

// Known category keywords for fast local inference (no API call needed for common merchants)
const CATEGORY_KEYWORDS = {
  food_delivery: ["swiggy", "zomato", "foodpanda", "dunzo", "blinkit", "zepto", "instamart"],
  travel: ["indigo", "airlines", "air india", "spicejet", "goair", "makemytrip", "irctc", "ola", "uber", "rapido", "redbus", "cleartrip", "yatra"],
  online_shopping: ["amazon", "flipkart", "myntra", "nykaa", "meesho", "ajio", "croma", "snapdeal", "tata cliq"],
  fuel: ["petrol", "hp ", "indian oil", "bharat petroleum", "shell", "reliance fuel"],
  groceries: ["bigbasket", "grofers", "jiomart", "dmart", "nature's basket", "more supermarket"],
  entertainment: ["bookmyshow", "pvr", "inox", "netflix", "spotify", "hotstar", "prime video", "zee5"],
};

/**
 * Infer category from merchant name using keyword matching.
 * Falls back to "others" if nothing matches.
 */
function inferCategory(merchant) {
  const lower = merchant.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "others";
}

/**
 * POST /api/recommend
 * Computes best card mathematically, asks Claude only for reasoning.
 * Claude never touches the numbers — we do the math, Claude writes the sentence.
 */
async function recommend({ merchant, amount, category, cards }) {
  // Step 1: determine category deterministically
  const resolvedCategory = category || inferCategory(merchant);

  // Step 2: compute cashback for every card — pure arithmetic, no LLM
  const ranked = cards
    .map((card) => {
      const rate = card.cashbackRates[resolvedCategory] ?? card.cashbackRates.others ?? 1;
      return {
        card: card.name,
        cashbackRate: rate,
        cashbackAmount: parseFloat(((rate / 100) * amount).toFixed(2)),
      };
    })
    .sort((a, b) => b.cashbackAmount - a.cashbackAmount);

  const best = ranked[0];
  const alternatives = ranked.slice(1, 3).map(({ card, cashbackAmount }) => ({ card, cashbackAmount }));

  // Step 3: ask Claude only for the one-sentence reasoning
  const reasoningPrompt = `A user is about to spend ₹${amount} at ${merchant} (category: ${resolvedCategory}).
The best card is ${best.card} with ${best.cashbackRate}% cashback earning ₹${best.cashbackAmount}.
Write exactly one sentence explaining why this card is best for this transaction. Be specific about the rate and amount.`;

  const response = await withTimeout(
    client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: "You are CardSense. Respond with exactly one sentence, no JSON, no extra text.",
      messages: [{ role: "user", content: reasoningPrompt }],
    })
  );

  return {
    bestCard: best.card,
    cashbackRate: best.cashbackRate,
    cashbackAmount: best.cashbackAmount,
    reasoning: response.content[0].text.trim(),
    alternatives,
  };
}

/**
 * For a given transaction, find the best card and its cashback using pure arithmetic.
 */
function bestCardForTransaction(txn, cards) {
  let best = null;
  for (const card of cards) {
    const rate = card.cashbackRates[txn.category] ?? card.cashbackRates.others ?? 1;
    const cashback = parseFloat(((rate / 100) * txn.amount).toFixed(2));
    if (!best || cashback > best.cashback) {
      best = { card: card.name, rate, cashback };
    }
  }
  return best;
}

/**
 * POST /api/analyze
 * Computes all numbers in Node — deterministic, never hallucinates.
 * Claude only provides a one-sentence headline insight.
 */
async function analyze({ transactions, cards }) {
  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
  const totalActualCashback = parseFloat(
    transactions.reduce((s, t) => s + (t.cashbackEarned || 0), 0).toFixed(2)
  );

  // Per-transaction: what was possible vs what was earned
  const enriched = transactions.map((txn) => {
    const best = bestCardForTransaction(txn, cards);
    const possible = best.cashback;
    const actual = txn.cashbackEarned || 0;
    const missed = parseFloat(Math.max(0, possible - actual).toFixed(2));
    return { ...txn, bestCard: best.card, bestRate: best.rate, possible, missed };
  });

  const totalPossibleCashback = parseFloat(
    enriched.reduce((s, t) => s + t.possible, 0).toFixed(2)
  );
  const missedSavings = parseFloat((totalPossibleCashback - totalActualCashback).toFixed(2));

  // Group by category
  const categoryMap = {};
  for (const t of enriched) {
    if (!categoryMap[t.category]) categoryMap[t.category] = { spend: 0, missed: 0 };
    categoryMap[t.category].spend += t.amount;
    categoryMap[t.category].missed += t.missed;
  }
  const byCategory = Object.entries(categoryMap).map(([category, v]) => ({
    category,
    spend: parseFloat(v.spend.toFixed(2)),
    missed: parseFloat(v.missed.toFixed(2)),
  })).sort((a, b) => b.missed - a.missed);

  // Top missed transactions (only where a better card existed)
  const topMissedTransactions = enriched
    .filter((t) => t.missed > 0 && t.bestCard !== t.cardUsed)
    .sort((a, b) => b.missed - a.missed)
    .slice(0, 5)
    .map((t) => ({
      merchant: t.merchant,
      amount: t.amount,
      usedCard: t.cardUsed,
      betterCard: t.bestCard,
      missed: t.missed,
    }));

  return {
    totalSpend,
    totalActualCashback,
    totalPossibleCashback,
    missedSavings,
    byCategory,
    topMissedTransactions,
  };
}

/**
 * POST /api/chat
 * Conversational advisor with full transaction history as context.
 */
async function chat({ userMessage, transactions, cards, history = [] }) {
  const contextMessage = `User's cards: ${JSON.stringify(cards)}
Recent transactions (last 30): ${JSON.stringify(transactions.slice(-30))}

User asks: ${userMessage}`;

  const messages = [
    ...history,
    { role: "user", content: contextMessage },
  ];

  const response = await withTimeout(
    client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `You are CardSense, a friendly and sharp credit card advisor for Indian consumers.
You have access to the user's transaction history and card portfolio.
Be conversational but specific — always mention exact rupee amounts when relevant.
Never recommend cards the user doesn't own. Keep responses under 4 sentences unless asked to elaborate.`,
      messages,
    })
  );

  return response.content[0].text;
}

module.exports = { recommend, analyze, chat };
