import { resultToast } from "@/components/result-toast";
import type { Card } from "./cards";
import { isBlackjack, isBust, maxHandValue } from "./hands";

export const getWinnings = (
  playerHand: Card[],
  dealerHand: Card[],
  bet: number,
  sideBetWinnings: number
) => {
  let winnings = sideBetWinnings;
  const playerValue = maxHandValue(playerHand);
  const dealerValue = maxHandValue(dealerHand);

  if (isBust(playerHand)) {
    resultToast({ message: "Player bust!", winnings });
    return winnings;
  }

  if (isBlackjack(dealerHand)) {
    resultToast({ message: "Dealer blackjack!", winnings: winnings });
    return winnings;
  }

  if (isBlackjack(playerHand)) {
    winnings += 2.5 * bet;
    resultToast({ message: "Player blackjack!", winnings: winnings });
  } else if (playerValue > dealerValue || isBust(dealerHand)) {
    winnings += 2 * bet;
    resultToast({ message: "Player wins!", winnings: winnings });
  } else if (playerValue === dealerValue) {
    winnings += bet;
    resultToast({ message: "Push!", winnings: winnings });
  } else {
    resultToast({ message: "Dealer wins!", winnings: winnings });
  }

  return winnings;
};
