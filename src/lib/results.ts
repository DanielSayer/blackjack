import { resultToast } from "@/components/result-toast";
import type { Card } from "./cards";
import { isBlackjack, isBust, maxHandValue } from "./hands";
import type { Bet } from "@/stores/useBlackjackStore";

export const getWinnings = (
  playerHand: { cards: Card[]; bet: Bet }[],
  dealerHand: Card[],
  sideBetWinnings: number
) => {
  let winnings = sideBetWinnings;

  playerHand.forEach((hand) => {
    const playerValue = maxHandValue(hand.cards);
    const dealerValue = maxHandValue(dealerHand);

    if (isBust(hand.cards)) {
      resultToast({ message: "Player bust!", winnings });
    } else if (isBlackjack(dealerHand)) {
      resultToast({ message: "Dealer blackjack!", winnings: winnings });
      return winnings;
    } else if (isBlackjack(hand.cards)) {
      winnings += 2.5 * hand.bet.hand;
      resultToast({ message: "Player blackjack!", winnings: winnings });
    } else if (playerValue > dealerValue || isBust(dealerHand)) {
      winnings += 2 * hand.bet.hand;
      resultToast({ message: "Player wins!", winnings: winnings });
    } else if (playerValue === dealerValue) {
      winnings += hand.bet.hand;
      resultToast({ message: "Push!", winnings: winnings });
    } else {
      resultToast({ message: "Dealer wins!", winnings: winnings });
    }
  });

  return winnings;
};
