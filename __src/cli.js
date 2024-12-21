import { formatHand, RANKS, SUITS } from './pokerEvaluator.js';

function evaluateAndPrint(cards, index) {
    const result = formatHand(cards);
    console.log(`\nTest Hand #${index + 1}:`);
    console.log('Input:', result.cards.join(' '));
    console.log('Evaluation:', result.hand);
    console.log('Rank:', result.rank);
    console.log('-'.repeat(40));
    return result.rank > 0; // Return true if hand was valid
}

// Test cases
const testHands = [
    ['AS', 'KS', 'QS', 'JS', 'TS'], // Royal Flush
    ['7H', '7D', '7S', '7C', 'JD'], // Four of a Kind
    ['TS', 'TC', 'TH', 'JD', 'JC'], // Full House
    ['2H', '3H', '4H', '5H', '7H'], // Flush
    ['9C', 'TC', 'JD', 'QH', 'KS'], // Straight
    ['QC', 'QH', 'QS', '9H', '2D'], // Three of a Kind
    ['KH', 'KD', 'JC', 'JS', '7C'], // Two Pair
    ['AH', 'AD', '8C', '4S', '2C'], // One Pair
    ['KH', 'JD', '8C', '7S', '3H']  // High Card
];

console.log('🎲 Poker Hand Evaluator v1.0');
console.log('============================');
console.log('Configuration:');
console.log('- Available ranks:', RANKS.join(', '));
console.log('- Available suits:', SUITS.join(', '));
console.log('\nEvaluating test hands...\n');

let validHands = 0;
testHands.forEach((hand, index) => {
    if (evaluateAndPrint(hand, index)) {
        validHands++;
    }
});

console.log('\nSummary:');
console.log('--------');
console.log(`Total hands evaluated: ${testHands.length}`);
console.log(`Valid hands: ${validHands}`);
console.log(`Invalid hands: ${testHands.length - validHands}`);
console.log('\nEvaluation complete! ✨');
