import { massToast, resultToast } from "@/components/result-toast";
import type { Card } from "./cards";
import { isBlackjack, isBust, maxHandValue } from "./hands";
import type { Bet } from "@/stores/useBlackjackStore";

export const getWinnings = (
  playerHands: { cards: Card[]; bet: Bet }[],
  dealerHand: Card[],
  sideBetWinnings: number
) => {
  let winnings = sideBetWinnings;
  const results: string[] = [];
  const numberOfPlayers = playerHands.length;
  if (isBlackjack(dealerHand)) {
    resultToast({ message: "Dealer blackjack!", winnings, numberOfPlayers: 1 });
    return winnings;
  }

  playerHands.forEach((hand) => {
    let playerWinnings = 0;
    const playerValue = maxHandValue(hand.cards);
    const dealerValue = maxHandValue(dealerHand);

    if (isBust(hand.cards)) {
      results.push("Player bust!");
      resultToast({ message: "Player bust!", winnings: 0, numberOfPlayers });
    } else if (isBlackjack(hand.cards)) {
      results.push("Player blackjack!");
      playerWinnings += 2.5 * hand.bet.hand;
      resultToast({
        message: "Player blackjack!",
        winnings: playerWinnings,
        numberOfPlayers,
      });
    } else if (playerValue > dealerValue || isBust(dealerHand)) {
      results.push("Player wins!");
      playerWinnings += 2 * hand.bet.hand;
      resultToast({
        message: "Player wins!",
        winnings: playerWinnings,
        numberOfPlayers,
      });
    } else if (playerValue === dealerValue) {
      results.push("Push!");
      playerWinnings += hand.bet.hand;
      resultToast({
        message: "Push!",
        winnings: playerWinnings,
        numberOfPlayers,
      });
    } else {
      results.push("Dealer wins!");
      resultToast({
        message: "Dealer wins!",
        winnings: playerWinnings,
        numberOfPlayers,
      });
    }

    winnings += playerWinnings;
  });

  if (playerHands.length !== 1) {
    massToast({ winnings, details: results });
  }
  return winnings;
};
