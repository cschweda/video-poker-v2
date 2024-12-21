import { dealHand } from '../src/dealer.js';
import { evaluatePokerHand, HANDS } from './index.js';  // Changed import source

// Function to map card code to image path
function getCardImagePath(cardCode) {
    if (!cardCode || cardCode.length !== 2) {
        return 'images/cards/back.png'; // Default card back
    }
    return `images/cards/${cardCode.toLowerCase()}.png`;
}

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
            // Evaluate the hand using the main evaluator
            const handRank = evaluatePokerHand(hand);
            
            // Display hand type and score (handRank will be 0-9)
            handTypeDisplay.textContent = HANDS[handRank] || 'Invalid Hand';
            handScoreDisplay.textContent = `Score: ${handRank}`;
            
            console.log('Hand:', HANDS[handRank]);
            console.log('Shuffle Quality:', quality.rating);
        } catch (error) {
            console.error('Hand evaluation error:', error);
            handTypeDisplay.textContent = 'Invalid Hand';
            handScoreDisplay.textContent = 'Score: 0';
        }

        // Update cards with new values
        cards.forEach((card, index) => {
            if (!holdButtons[index].classList.contains('active')) {
                card.className = 'card';
                card.style.backgroundImage = `url('${getCardImagePath(hand[index])}')`;
            }
        });
    });

    // Toggle hold buttons
    holdButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
        });
    });
});
