export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS = ['C', 'D', 'H', 'S'];
export const HANDS = [
    'Invalid Hand',
    'High Card',
    'One Pair',
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush'
];

export function evaluatePokerHand(cards) {
    // ...existing evaluatePokerHand function code...
}

export function formatHand(cards) {
    const result = evaluatePokerHand(cards);
    return {
        cards,
        hand: HANDS[result],
        rank: result
    };
}

export default {
    evaluatePokerHand,
    formatHand,
    RANKS,
    SUITS,
    HANDS
};
