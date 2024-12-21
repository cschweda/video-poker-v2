import { RANKS, SUITS } from "../index.js";

/**
 * Calculates shuffle quality metrics
 * @param {string[]} deck Shuffled deck to analyze
 * @returns {Object} Quality metrics
 */
function analyzeShuffleQuality(deck) {
  // Calculate runs (consecutive cards from same suit or sequential ranks)
  let runs = 0;
  let entropy = 0;
  const suitRuns = { C: 0, D: 0, H: 0, S: 0 };

  for (let i = 1; i < deck.length; i++) {
    const prevCard = deck[i - 1];
    const currCard = deck[i];

    // Count suit runs
    if (prevCard[1] === currCard[1]) {
      suitRuns[currCard[1]]++;
      runs++;
    }

    // Count rank runs
    const prevRank = RANKS.indexOf(prevCard[0]);
    const currRank = RANKS.indexOf(currCard[0]);
    if (Math.abs(prevRank - currRank) === 1) {
      runs++;
    }
  }

  // Calculate entropy (randomness measure)
  const positions = deck.reduce((acc, card) => {
    if (!acc[card]) acc[card] = [];
    acc[card].push(deck.indexOf(card));
    return acc;
  }, {});

  Object.values(positions).forEach((pos) => {
    const p = pos.length / deck.length;
    entropy -= p * Math.log2(p);
  });

  // Score from 0-100 based on entropy and runs
  const maxRuns = deck.length - 1;
  const runScore = 100 * (1 - runs / maxRuns);
  const entropyScore = 100 * (entropy / Math.log2(deck.length));
  const finalScore = Math.round((runScore + entropyScore) / 2);

  return {
    quality: finalScore,
    runs,
    entropy: entropy.toFixed(2),
    rating:
      finalScore > 90
        ? "Excellent"
        : finalScore > 80
        ? "Good"
        : finalScore > 70
        ? "Fair"
        : "Poor",
  };
}

/**
 * Creates and shuffles a standard 52-card deck using Fisher-Yates algorithm
 * @returns {Object} Shuffled deck and quality metrics
 */
export function createShuffledDeck() {
  // Create ordered deck
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(`${rank}${suit}`);
    }
  }

  // Fisher-Yates shuffle implementation
  let currentIndex = deck.length;
  let randomIndex;

  // While there remain elements to shuffle
  while (currentIndex > 0) {
    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap it with the current element
    [deck[currentIndex], deck[randomIndex]] = [
      deck[randomIndex],
      deck[currentIndex],
    ];
  }

  const quality = analyzeShuffleQuality(deck);
  return { deck, quality };
}

/**
 * Deals a specified number of cards from a shuffled deck
 * @param {number} count Number of cards to deal (default: 5)
 * @returns {Object} Dealt hand and quality metrics
 */
export function dealHand(count = 5) {
  if (count < 1 || count > 52) {
    throw new Error("Hand size must be between 1 and 52 cards");
  }

  const { deck, quality } = createShuffledDeck();
  return {
    hand: deck.slice(0, count),
    quality,
  };
}
