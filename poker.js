// Constants
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
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

// Dealer functions
export function dealHand(count = 5) {
    const deck = [];
    for (let rank of RANKS) {
        for (let suit of SUITS) {
            deck.push(rank + suit);
        }
    }

    // Fisher-Yates shuffle
    let quality = { swaps: 0, rating: "poor" };
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        if (i !== j) quality.swaps++;
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    quality.rating = quality.swaps > 20 ? "good" : "poor";
    return { hand: deck.slice(0, count), quality };
}

// Hand evaluation function
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

// UI Functions
function getCardImagePath(cardCode) {
    if (!cardCode || cardCode.length !== 2) {
        return 'images/cards/back.png';
    }
    return `images/cards/${cardCode.toLowerCase()}.png`;
}

// Main game logic
document.addEventListener('DOMContentLoaded', () => {
    const holdButtons = document.querySelectorAll('.hold-button');
    const cards = document.querySelectorAll('.card');
    const dealButton = document.querySelector('.deal-button');
    const handTypeDisplay = document.querySelector('.hand-type');
    const handScoreDisplay = document.querySelector('.hand-score');
    let isFirstDeal = true;
    let currentHand = [];

    dealButton.addEventListener('click', () => {
        if (isFirstDeal) {
            holdButtons.forEach(button => button.style.display = 'block');
            isFirstDeal = false;
        }

        const { hand, quality } = dealHand(5);
        currentHand = hand;

        try {
            const handRank = evaluatePokerHand(hand);
            handTypeDisplay.textContent = HANDS[handRank] || 'Invalid Hand';
            handScoreDisplay.textContent = `Score: ${handRank}`;
            console.log('Hand:', HANDS[handRank]);
            console.log('Shuffle Quality:', quality.rating);
        } catch (error) {
            console.error('Hand evaluation error:', error);
            handTypeDisplay.textContent = 'Invalid Hand';
            handScoreDisplay.textContent = 'Score: 0';
        }

        cards.forEach((card, index) => {
            if (!holdButtons[index].classList.contains('active')) {
                card.className = 'card';
                card.style.backgroundImage = `url('${getCardImagePath(hand[index])}')`;
            }
        });
    });

    holdButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
        });
    });
});
