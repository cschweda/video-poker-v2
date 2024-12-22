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
  "Low Pair/No Pair", // Changed from "High Card"
  "High Pair", // Changed from "One Pair"
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
    fours = 0,
    highPairFound = false;

  rankCount.forEach((count, index) => {
    if (count === 2) {
      pairs++;
      // Check if it's a high pair (Jacks or better)
      if (index >= RANKS.indexOf("J")) {
        highPairFound = true;
      }
    }
    if (count === 3) threes++;
    if (count === 4) fours++;
  });

  if (fours) return 8;
  if (threes && pairs) return 7;
  if (isFlush) return 6;
  if (isStraight) return 5;
  if (threes) return 4;
  if (pairs === 2) return 3;
  if (pairs === 1 && highPairFound) return 2;
  return 1; // Return 1 for low pair or no pair
}

// UI Functions
function getCardImagePath(cardCode) {
  if (!cardCode || cardCode.length !== 2) {
    return "images/cards/back.png";
  }
  return `images/cards/${cardCode.toLowerCase()}.png`;
}

// First, declare all game state variables at the top
const gamePhase = {
  BETTING: "betting",
  FIRST_DEAL: "firstDeal",
  DRAW: "draw",
  GAME_OVER: "gameOver",
};

// Game state object
const gameState = {
  currentPhase: gamePhase.BETTING,
  // ...rest of gameState properties...
};

document.addEventListener("DOMContentLoaded", () => {
  // Add odds lookup table at the top of the DOM content loaded handler
  const HAND_ODDS = {
    "Royal Flush": "1:649,740",
    "Straight Flush": "1:72,193",
    "Four of a Kind": "1:4,165",
    "Full House": "1:694",
    Flush: "1:509",
    Straight: "1:255",
    "Three of a Kind": "1:47",
    "High Pair": "1:2.37", // Changed from "One Pair"
    "Low Pair/No Pair": "1:1",
    "Invalid Hand": "-",
  };

  const holdButtons = document.querySelectorAll(".hold-button");
  const cards = document.querySelectorAll(".card");
  const mainDealButton = document.querySelector(".deal-button");
  const handTypeDisplay = document.querySelector(".hand-type");
  // Remove handScoreDisplay declaration

  const increaseCoin = document.querySelector("#increaseCoin");
  const decreaseCoin = document.querySelector("#decreaseCoin");
  const coinDisplay = document.querySelector(".coin-display");
  const coinDealButton = document.querySelector(".coin-deal-button");
  // Remove betMaxCoin declaration

  let coins = 0;

  function updateBankrollDisplay() {
    const bankrollAmountEl = document.querySelector(".bankroll-amount");
    if (bankrollAmountEl) {
      bankrollAmountEl.textContent = bankroll - coins; // Fix: now has access to coins
    }
  }

  const updateCoinInterface = () => {
    const isBettingPhase = gameState.currentPhase === gamePhase.BETTING;
    coinDisplay.textContent = coins;
    // Only enable coin buttons in start phase
    decreaseCoin.disabled = !isBettingPhase || coins <= 0;
    increaseCoin.disabled = !isBettingPhase || coins >= 5;
    // Only show coin deal button in start phase with coins
    coinDealButton.classList.toggle("visible", isBettingPhase && coins > 0);
    // Main deal button only visible during discard phase
    mainDealButton.style.display =
      gameState.currentPhase === gamePhase.FIRST_DEAL ? "block" : "none";

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
  };

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

  let currentHand = [];

  // Add session stats tracking with localStorage persistence
  const savedSessionStats = localStorage.getItem("pokerSessionStats");
  const sessionStats = savedSessionStats
    ? JSON.parse(savedSessionStats)
    : {
        startTime: new Date().toISOString(),
        initialBankroll: INITIAL_BANKROLL,
        hands: [],
        currentBankroll: INITIAL_BANKROLL,
        totalWagered: 0,
        totalWon: 0,
      };

  function logHand(handData) {
    // Insert new hand at beginning of array instead of pushing to end
    sessionStats.hands.unshift({
      timestamp: new Date().toISOString(),
      hand: handData.hand,
      bet: handData.bet,
      heldCards: handData.heldCards,
      finalHand: handData.finalHand,
      handType: handData.handType,
      odds: HAND_ODDS[handData.handType], // Add odds to the hand data
      winnings: handData.winnings,
      bankrollAfter: handData.bankrollAfter,
    });

    sessionStats.currentBankroll = handData.bankrollAfter;
    sessionStats.totalWagered += handData.bet;
    sessionStats.totalWon += handData.winnings;

    // Add summary data at top of stats object before saving
    const statsWithSummary = {
      lastUpdated: new Date().toISOString(),
      totalHands: sessionStats.hands.length,
      totalWagered: sessionStats.totalWagered,
      totalWon: sessionStats.totalWon,
      netProfit: sessionStats.totalWon - sessionStats.totalWagered,
      ...sessionStats,
    };

    localStorage.setItem("pokerSessionStats", JSON.stringify(statsWithSummary));
    console.log("Session Stats Updated:", statsWithSummary);
  }

  function exportStats() {
    // Add summary section at top of export
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalHands: sessionStats.hands.length,
        totalWagered: sessionStats.totalWagered,
        totalWon: sessionStats.totalWon,
        netProfit: sessionStats.totalWon - sessionStats.totalWagered,
        winLossRatio:
          sessionStats.hands.length > 0
            ? (
                stats.sessionWins /
                (stats.sessionWins + stats.sessionLosses)
              ).toFixed(2)
            : "0.00",
        bestHand: stats.bestHand || "None",
        bestHandOdds: stats.bestHand ? HAND_ODDS[stats.bestHand] : "-",
      },
      handOddsTable: HAND_ODDS, // Include complete odds table in export
      sessionData: sessionStats,
    };

    const statsJson = JSON.stringify(exportData, null, 2);
    const blob = new Blob([statsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poker-session-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Add export button event listener
  document.getElementById("exportStats").addEventListener("click", exportStats);

  // Add stats management
  const stats = {
    sessionWins: 0,
    sessionLosses: 0,
    bestHand: "",
    bestHandRank: 0,
    totalHands: 0,
    ...JSON.parse(localStorage.getItem("pokerStats") || "{}"),
  };

  function updateStats(handType, handRank, winnings) {
    // Count high pair (handRank === 2) as a win
    if (winnings > 0 || handType === "High Pair") {
      stats.sessionWins++;
    } else {
      stats.sessionLosses++;
    }

    // Increment total hands counter
    stats.totalHands++;

    if (handRank > stats.bestHandRank) {
      stats.bestHand = handType;
      stats.bestHandRank = handRank;
    }

    localStorage.setItem("pokerStats", JSON.stringify(stats));
    displayStats();
  }

  function displayStats() {
    document.getElementById("sessionWins").textContent = stats.sessionWins;
    document.getElementById("sessionLosses").textContent = stats.sessionLosses;

    // New ratio calculation
    const winRatio = document.getElementById("winRatio");
    if (stats.sessionLosses === 0) {
      winRatio.textContent = stats.sessionWins > 0 ? "∞" : "0.00";
      winRatio.className = "stat-value positive";
    } else {
      const ratio = (stats.sessionWins / stats.sessionLosses).toFixed(2);
      winRatio.textContent = ratio;
      winRatio.className = `stat-value ${
        ratio > 1 ? "positive" : ratio < 1 ? "negative" : ""
      }`;
    }

    document.getElementById("bestHand").textContent = stats.bestHand || "-";

    // Update total hands display - check if element exists first
    let totalHandsEl = document.getElementById("totalHandsDisplay");
    if (!totalHandsEl) {
      // Create element only if it doesn't exist
      totalHandsEl = document.createElement("div");
      totalHandsEl.className = "stat-row";
      totalHandsEl.id = "totalHandsDisplay";
      totalHandsEl.innerHTML = `
        <span class="stat-label">Total Hands:</span>
        <span class="stat-value">${stats.totalHands}</span>
      `;
      // Insert at the top of stats container
      const statsContainer = document.querySelector(".stats-container");
      statsContainer.insertBefore(totalHandsEl, statsContainer.firstChild);
    } else {
      // Just update the value if element exists
      totalHandsEl.querySelector(".stat-value").textContent = stats.totalHands;
    }
  }

  // Modify reset functionality to clear all stored data
  function resetStats() {
    if (
      confirm(
        "Are you sure you want to reset all statistics and bankroll? This cannot be undone."
      )
    ) {
      // Reset runtime stats
      stats.sessionWins = 0;
      stats.sessionLosses = 0;
      stats.bestHand = "";
      stats.bestHandRank = 0;
      stats.totalHands = 0; // Reset total hands counter

      // Reset bankroll to initial value
      bankroll = INITIAL_BANKROLL;

      // Reset session data
      sessionStats.hands = [];
      sessionStats.totalWagered = 0;
      sessionStats.totalWon = 0;
      sessionStats.startTime = new Date().toISOString();
      sessionStats.initialBankroll = INITIAL_BANKROLL;
      sessionStats.currentBankroll = INITIAL_BANKROLL;

      // Hide game over display
      const rankDisplay = document.querySelector(".rank-display");
      rankDisplay.classList.remove("visible");
      handTypeDisplay.textContent = "";

      // Clear all stored data
      localStorage.removeItem("pokerStats");
      localStorage.removeItem("pokerSessionStats");

      // Save fresh session state
      localStorage.setItem("pokerSessionStats", JSON.stringify(sessionStats));
      localStorage.setItem("pokerStats", JSON.stringify(stats));

      // Update UI
      displayStats();
      updateBankrollDisplay();
      console.log("Stats, logging, bankroll, and display reset to initial values");
    }
  }

  // Update reset button listener
  document.getElementById("resetStats").addEventListener("click", resetStats);

  // Move phase01 function definition before any code that uses it
  function phase01() {
    console.log("=== INITIAL DEAL PHASE ===");

    // Disable coin interface after dealing
    decreaseCoin.disabled = true;
    increaseCoin.disabled = true;
    coinDealButton.classList.remove("visible");

    // Deduct coins from bankroll
    bankroll -= coins;
    updateBankrollDisplay();
    console.log("Wager:", coins);
    console.log("Bankroll after wager:", bankroll);

    // Initial deal
    holdButtons.forEach((button) => {
      button.style.display = "block";
      button.classList.remove("active");
    });
    mainDealButton.textContent = "DISCARD";
    mainDealButton.style.display = "block";

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
        setTimeout(() => {
          holdButtons[index].style.visibility = "visible";
          holdButtons[index].classList.add("show");
        }, 200);
      }, index * 200);
    });

    gameState.currentPhase = gamePhase.FIRST_DEAL;
    console.log("Ready for player to select holds");
  }

  // Game phase functions
  function startPhase() {
    console.log("=== STARTING NEW GAME ===");

    currentHand = [];
    gameState.currentPhase = gamePhase.BETTING;
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

    // Hide export button at start
    document.getElementById("exportStats").style.cssText =
      "opacity: 0; visibility: hidden;";
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
      const handType = HANDS[handRank] || "Invalid Hand";

      // Define payoutTable before using it
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

      // Log the completed hand
      logHand({
        hand: currentHand.slice(), // Use slice() instead of spread
        bet: coins,
        heldCards: heldPositions,
        finalHand: currentHand.slice(),
        handType: handType,
        winnings: winnings,
        bankrollAfter: bankroll + winnings,
      });

      handTypeDisplay.innerHTML = handType;
      document.querySelector(".winnings-amount").textContent = winnings;

      // Add winnings to bankroll
      bankroll += winnings;
      updateBankrollDisplay();

      console.log("Final Hand:", currentHand);
      console.log("Hand Type:", handType);
      console.log("Winnings:", winnings);
      console.log("Bankroll after winnings:", bankroll);

      // Add stats update
      updateStats(handType, handRank, winnings);

      // Show export button with game over screen
      document.getElementById("exportStats").style.cssText =
        "opacity: 1; visibility: visible;";
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
    gameState.currentPhase = gamePhase.BETTING;

    console.log("=== GAME OVER ===");

    // Update bankroll at game over
    updateBankrollDisplay();
  }

  function handleDealClick() {
    if (gameState.currentPhase === gamePhase.BETTING && coins === 0) {
      console.log("Cannot deal: No coins inserted");
      return;
    }

    switch (gameState.currentPhase) {
      case gamePhase.BETTING:
        phase01();
        break;
      case gamePhase.FIRST_DEAL:
        phase02();
        break;
      case gamePhase.DRAW:
        startPhase();
        break;
    }
  }

  // Initialize game
  startPhase();

  // Handle card/button holds
  const toggleHold = (index) => {
    if (gameState.currentPhase !== gamePhase.FIRST_DEAL) {
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

  // Initialize stats display
  displayStats();
});
