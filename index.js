// Constants and core poker logic exports
export const RANKS = [
    "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"
];

export const SUITS = ["C", "D", "H", "S"];

export const HANDS = [
    "Invalid Hand",
    "High Card",
    "One Pair",
    "Two Pair",
    "Three of a Kind",
    "Straight",
    "Flush",
    "Full House",
    "Four of a Kind",
    "Straight Flush"
];

/**
 * Evaluates a poker hand and returns its ranking
 * @param {string[]} cards - Array of 5 card strings in format "RS" where R=rank and S=suit
 * @returns {number} Hand ranking value (0-9)
 * @throws {Error} If input is not properly formatted
 * @example
 * evaluatePokerHand(["AS", "KS", "QS", "JS", "TS"]) // returns 9 (Straight Flush)
 */
export function evaluatePokerHand(cards) {
  // Input validation
  if (!Array.isArray(cards)) {
    throw new Error("Input must be an array of cards");
  }

  if (cards.length !== 5) {
    throw new Error("Hand must contain exactly 5 cards");
  }

  if (!cards.every((card) => typeof card === "string" && card.length === 2)) {
    throw new Error("Each card must be a 2-character string (rank + suit)");
  }

  let suits = 0,
    ranks = 0,
    rankCount = Array(13).fill(0);
  let firstSuit = -1;

  // Parse cards and build bit representations
  for (let card of cards) {
    const rankChar = card[0];
    const suitChar = card[1];
    const rank = RANKS.indexOf(rankChar);
    const suit = SUITS.indexOf(suitChar);

    if (rank === -1 || suit === -1) return 0; // Invalid card

    if (firstSuit === -1) firstSuit = suit;

    suits |= 1 << suit;
    ranks |= 1 << rank;
    rankCount[rank]++;
  }

  const isFlush = suits === 1 << firstSuit;
  const isStraight =
    ranks && !(ranks & (ranks - 1))
      ? true
      : ranks === 0x1f ||
        ranks === 0x3e ||
        ranks === 0x7c ||
        ranks === 0xf8 ||
        ranks === 0x1f0 ||
        ranks === 0x3e0 ||
        ranks === 0x7c0 ||
        ranks === 0xf80 ||
        ranks === 0x1f00;

  if (isFlush && isStraight) return 9;

  // Count combinations
  let pairs = 0,
    threes = 0,
    fours = 0;
  rankCount.forEach((count) => {
    if (count === 2) pairs++;
    if (count === 3) threes++;
    if (count === 4) fours++;
  });

  if (fours) return 8;
  if (threes && pairs) return 7;
  if (isFlush) return 6;
  if (isStraight) return 5;
  if (threes) return 4;
  if (pairs === 2) return 3;
  if (pairs === 1) return 2;
  return 1;
}

/**
 * Evaluates a poker hand and prints the result
 * @param {string[]} cards - Array of 5 card strings in format "RS" where R=rank and S=suit
 */
function evaluateAndPrint(cards) {
  try {
    console.log("\nHand:", cards.join(" "));
    const result = evaluatePokerHand(cards);
    console.log("Evaluation:", HANDS[result]);
  } catch (error) {
    console.error("Error:", error.message);
  }
  console.log("-".repeat(30));
}

// Move test code into a separate function so it doesn't run automatically when imported
export async function runTests() {
  const { testHands, errorTests } = await import("./__src/testCases.js");

  console.log("Poker Hand Evaluator\n");
  console.log("Using RANKS:", RANKS);
  console.log("Using SUITS:", SUITS);
  console.log("\nEvaluating valid hands...\n");

  testHands.forEach((hand) => evaluateAndPrint(hand));

  console.log("\nTesting error cases...\n");

  errorTests.forEach((hand) => {
    console.log("Testing invalid input:", hand);
    evaluateAndPrint(hand);
  });
}

// Game UI Logic
import { dealHand } from './src/dealer.js';

document.addEventListener('DOMContentLoaded', () => {
    const dealButton = document.querySelector('.deal-button');
    const cardElements = document.querySelectorAll('.card');
    const handTypeDisplay = document.querySelector('.hand-type');
    
    function displayCards(cards) {
        cards.forEach((card, index) => {
            const cardElement = cardElements[index];
            cardElement.className = 'card';
            cardElement.style.backgroundImage = `url(images/cards/${card.toLowerCase()}.png)`;
        });
    }

    function updateHandDisplay(cards) {
        const result = evaluatePokerHand(cards);
        handTypeDisplay.textContent = HANDS[result];
    }

    dealButton.addEventListener('click', () => {
        const { hand } = dealHand();
        displayCards(hand);
        updateHandDisplay(hand);
    });
});

// Default export
export default {
    evaluatePokerHand,
    RANKS,
    SUITS,
    HANDS
};
