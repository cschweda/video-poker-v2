// Constants
export const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
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
  "Straight Flush",
];
const INITIAL_BANKROLL = 1000;
let bankroll = INITIAL_BANKROLL;

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
    return "images/cards/back.png";
  }
  return `images/cards/${cardCode.toLowerCase()}.png`;
}

document.addEventListener("DOMContentLoaded", () => {
  const holdButtons = document.querySelectorAll(".hold-button");
  const cards = document.querySelectorAll(".card");
  const mainDealButton = document.querySelector(".deal-button");
  const handTypeDisplay = document.querySelector(".hand-type");
  // Remove handScoreDisplay declaration

  const increaseCoin = document.querySelector("#increaseCoin");
  const decreaseCoin = document.querySelector("#decreaseCoin");
  const coinDisplay = document.querySelector(".coin-display");
  const coinDealButton = document.querySelector(".coin-deal-button");
  const betMaxCoin = document.querySelector("#betMaxCoin");

  let coins = 0;

  function updateBankrollDisplay() {
    const bankrollAmountEl = document.querySelector(".bankroll-amount");
    if (bankrollAmountEl) {
      bankrollAmountEl.textContent = bankroll - coins; // Fix: now has access to coins
    }
  }

  function updateCoinInterface() {
    coinDisplay.textContent = coins;
    // Only enable coin buttons in start phase
    decreaseCoin.disabled = gamePhase !== "start" || coins <= 0;
    increaseCoin.disabled = gamePhase !== "start" || coins >= 5;
    // Only show coin deal button in start phase with coins
    coinDealButton.classList.toggle(
      "visible",
      gamePhase === "start" && coins > 0
    );
    // Main deal button only visible during discard phase
    mainDealButton.style.display = gamePhase === "phase01" ? "block" : "none";

    // Hide rank display when coins are added
    if (coins > 0) {
      const rankDisplay = document.querySelector(".rank-display");
      rankDisplay.classList.remove("visible");
      handTypeDisplay.textContent = "";
    }

    // Highlight the appropriate column in the ranking table
    const paytableCells = document.querySelectorAll(
      ".paytable td, .paytable th"
    );
    paytableCells.forEach((cell) => cell.classList.remove("highlight"));
    if (coins > 0) {
      const columnIndex = coins + 2; // Adjust for 1-based index and extra columns
      const cellsToHighlight = document.querySelectorAll(
        `.paytable td:nth-child(${columnIndex}), .paytable th:nth-child(${columnIndex})`
      );
      cellsToHighlight.forEach((cell) => cell.classList.add("highlight"));
    }

    updateBankrollDisplay(); // Reflect net bankroll as coins change

    // Flip cards to backs
    cards.forEach((card) => {
      card.className = "card card-back";
      card.style.backgroundImage = `url('${getCardImagePath()}')`;
    });
  }

  increaseCoin.addEventListener("click", () => {
    if (coins < 5) {
      coins++;
      updateCoinInterface();
    }
  });

  decreaseCoin.addEventListener("click", () => {
    if (coins > 0) {
      coins--;
      updateCoinInterface();
    }
  });

  betMaxCoin.addEventListener("click", () => {
    coins = 5;
    updateCoinInterface();
    handleDealClick(); // Start the game
  });

  let currentHand = [];
  let gamePhase = "start";

  // Game phase functions
  function startPhase() {
    console.log("=== STARTING NEW GAME ===");

    currentHand = [];
    gamePhase = "start";
    console.log("Current Bankroll:", bankroll);

    updateBankrollDisplay(); // Update bankroll widget

    // Reset UI elements
    mainDealButton.textContent = "DEAL";
    mainDealButton.style.display = "block"; // Show button at start
    handTypeDisplay.textContent = "";

    const rankDisplay = document.querySelector(".rank-display");
    rankDisplay.classList.remove("visible");
    handTypeDisplay.textContent = "";

    // Remove highlight from paytable columns
    const paytableCells = document.querySelectorAll(
      ".paytable td, .paytable th"
    );
    paytableCells.forEach((cell) => cell.classList.remove("highlight"));

    // Reset all hold buttons
    holdButtons.forEach((button) => {
      button.classList.remove("active");
      button.style.display = "none";
      button.disabled = false; // Ensure buttons are re-enabled
    });

    // Reset all cards
    cards.forEach((card) => {
      card.className = "card card-back";
      card.style.backgroundImage = `url('${getCardImagePath()}')`;
      card.classList.remove("held", "wiggling");
      card.style.transform = "none";
      card.style.animation = "none";
    });

    // Reset and enable coin interface
    coins = 0;
    updateCoinInterface();
    decreaseCoin.disabled = true; // Initially disabled because coins = 0
    increaseCoin.disabled = false;

    // Hide instruction text
    document.querySelector(".instruction-text").classList.remove("visible");

    // Enable bet max button at start
    betMaxCoin.disabled = false;
  }

  function phase01() {
    console.log("=== INITIAL DEAL PHASE ===");

    // Disable coin interface after dealing
    decreaseCoin.disabled = true;
    increaseCoin.disabled = true;
    coinDealButton.classList.remove("visible");

    // Deduct coins from bankroll
    bankroll -= coins;
    updateBankrollDisplay(); // Update after subtracting wager
    console.log("Wager:", coins);
    console.log("Bankroll after wager:", bankroll);

    // Initial deal
    holdButtons.forEach((button) => {
      button.style.display = "block";
      button.classList.remove("active");
    });
    mainDealButton.textContent = "DISCARD";
    mainDealButton.style.display = "block"; // Show main button for discard phase

    const { hand } = dealHand(5);
    currentHand = [...hand];
    console.log("Initial hand dealt:", currentHand);

    // Show cards one by one
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.className = "card";
        card.style.backgroundImage = `url('${getCardImagePath(
          currentHand[index]
        )}')`;

        // Show hold button after card is dealt
        setTimeout(() => {
          holdButtons[index].style.visibility = "visible";
          holdButtons[index].classList.add("show");
        }, 200); // Delay hold button appearance
      }, index * 200); // Stagger card dealing
    });

    gamePhase = "phase01";
    console.log("Ready for player to select holds");

    // Disable bet max button during play
    betMaxCoin.disabled = true;
  }

  function phase02() {
    console.log("=== DRAW PHASE ===");

    // Hide instruction text
    document.querySelector(".instruction-text").classList.remove("visible");

    // Handle the draw phase
    const heldPositions = Array.from(holdButtons)
      .map((btn, i) => (btn.classList.contains("active") ? i : -1))
      .filter((i) => i !== -1);

    const { hand: replacementCards } = dealHand(5);

    // Hide all hold buttons and reset their state
    holdButtons.forEach((button) => {
      button.style.display = "none";
      button.classList.remove("active");
    });

    // Replace unheld cards and reset all card positions
    let replacementIndex = 0;
    currentHand = currentHand.map((card, index) => {
      const cardElement = cards[index];
      if (heldPositions.includes(index)) {
        cardElement.classList.remove("held"); // Remove held state
        return card;
      } else {
        const newCard = replacementCards[replacementIndex++];
        cardElement.className = "card"; // Reset to base class
        cardElement.style.backgroundImage = `url('${getCardImagePath(
          newCard
        )}')`;
        return newCard;
      }
    });

    // Show game over message immediately
    document.querySelector(".rank-display").classList.add("visible");

    // Show final results
    try {
      const handRank = evaluatePokerHand(currentHand);
      handTypeDisplay.innerHTML = HANDS[handRank] || "Invalid Hand";
      console.log("Final Hand:", currentHand);
      console.log("Hand Type:", HANDS[handRank]);

      // Calculate and display winnings
      const payoutTable = [
        [0, 0, 0, 0, 0], // Invalid Hand
        [0, 0, 0, 0, 0], // High Card
        [1, 2, 3, 4, 5], // One Pair
        [2, 4, 6, 8, 10], // Two Pair
        [3, 6, 9, 12, 15], // Three of a Kind
        [4, 8, 12, 16, 20], // Straight
        [6, 12, 18, 24, 30], // Flush
        [9, 18, 27, 36, 45], // Full House
        [25, 50, 75, 100, 125], // Four of a Kind
        [50, 100, 150, 200, 250], // Straight Flush
        [800, 1600, 2400, 3200, 4000], // Royal Flush
      ];
      const winnings =
        handRank >= 2 ? payoutTable[handRank][coins - 1] || 0 : 0;
      document.querySelector(".winnings-amount").textContent = winnings;
      console.log("Winnings:", winnings);

      // Add winnings to bankroll
      bankroll += winnings;
      updateBankrollDisplay(); // Update after adding winnings
      console.log("Bankroll after winnings:", bankroll);
    } catch (error) {
      console.error("Hand evaluation error:", error);
      handTypeDisplay.innerHTML = "Invalid Hand";
      document.querySelector(".winnings-amount").textContent = "0";
    }

    // Reset coin interface and finish game
    coins = 0;
    coinDisplay.textContent = "0";
    decreaseCoin.disabled = true;
    increaseCoin.disabled = false;
    coinDealButton.classList.remove("visible");
    mainDealButton.style.display = "none";
    gamePhase = "start";

    console.log("=== GAME OVER ===");

    // Update bankroll at game over
    updateBankrollDisplay();

    // Re-enable bet max button at game over
    betMaxCoin.disabled = false;
  }

  function handleDealClick() {
    if (gamePhase === "start" && coins === 0) {
      console.log("Cannot deal: No coins inserted");
      return;
    }

    switch (gamePhase) {
      case "start":
        phase01();
        break;
      case "phase01":
        phase02();
        break;
      case "phase02":
        startPhase();
        break;
    }
  }

  // Initialize game
  startPhase();

  // Handle card/button holds
  const toggleHold = (index) => {
    if (gamePhase !== "phase01") {
      console.log("Hold attempted outside of hold phase");
      return;
    }

    const card = cards[index];
    const button = holdButtons[index];
    const isNowHeld = !button.classList.contains("active");

    button.classList.toggle("active");
    card.classList.toggle("held");

    console.log(
      `Card ${index + 1} (${currentHand[index]}) ${
        isNowHeld ? "held" : "released"
      }`
    );
    console.log(
      "Current held cards:",
      Array.from(holdButtons)
        .map((btn, i) =>
          btn.classList.contains("active") ? currentHand[i] : null
        )
        .filter((card) => card !== null)
    );
  };

  // Event listeners
  holdButtons.forEach((button, index) => {
    button.addEventListener("click", () => toggleHold(index));
  });

  cards.forEach((card, index) => {
    card.addEventListener("click", () => toggleHold(index));
  });

  // Main game loop
  mainDealButton.addEventListener("click", handleDealClick);
  coinDealButton.addEventListener("click", handleDealClick);
});
