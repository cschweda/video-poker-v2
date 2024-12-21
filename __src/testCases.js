export const testHands = [
  ["AS", "KS", "QS", "JS", "TS"], // Royal Flush
  ["KS", "QS", "JS", "TS", "9S"], // Straight Flush (not royal)
  ["7H", "7D", "7S", "7C", "JD"], // Four of a Kind
  ["TS", "TC", "TH", "JD", "JC"], // Full House
  ["2H", "3H", "4H", "5H", "7H"], // Flush
  ["9C", "TC", "JD", "QH", "KS"], // Straight
  ["AC", "2D", "3H", "4S", "5C"], // Wheel Straight (A-5)
  ["QC", "QH", "QS", "9H", "2D"], // Three of a Kind
  ["KH", "KD", "JC", "JS", "7C"], // Two Pair
  ["AH", "AD", "8C", "4S", "2C"], // One Pair
  ["KH", "JD", "8C", "7S", "3H"], // High Card (K high)
  ["9D", "4D", "8C", "7S", "3H"], // High Card (9 high)
  ["2C", "4D", "6H", "8S", "TD"], // No pairs, not straight (mixed suits)
  ["2C", "4C", "6C", "8C", "TC"], // Flush with no pairs
  ["2C", "3C", "4C", "5C", "7C"], // Flush without straight
];

export const errorTests = [
  ["AS", "KS", "QS", "JS"], // Too few cards
  ["AS", "KS", "QS", "JS", "TS", "2H"], // Too many cards
  ["A", "KS", "QS", "JS", "TS"], // Malformed card
  ["XX", "KS", "QS", "JS", "TS"], // Invalid card
  "AS KS QS JS TS", // Not an array
  [1, 2, 3, 4, 5], // Wrong data type
];
