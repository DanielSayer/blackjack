import { massToast, resultToast } from "@/components/result-toast";
import type { Card } from "./cards";
import { isBlackjack, isBust, maxHandValue } from "./hands";
import type { Bet } from "@/stores/useBlackjackStore";

type PlayerHand = { cards: Card[]; bet: Bet; isSplitHand?: boolean };

export type HandResult = {
  message: string;
  winnings: number;
};

export const getHandResult = (
  hand: PlayerHand,
  dealerHand: Card[]
): HandResult => {
  const playerValue = maxHandValue(hand.cards);
  const dealerValue = maxHandValue(dealerHand);
  const playerHasNaturalBlackjack = isBlackjack(hand.cards) && !hand.isSplitHand;
  const dealerHasBlackjack = isBlackjack(dealerHand);

  if (isBust(hand.cards)) {
    return { message: "Player bust!", winnings: 0 };
  }

  if (dealerHasBlackjack && playerHasNaturalBlackjack) {
    return { message: "Push!", winnings: hand.bet.hand };
  }

  if (dealerHasBlackjack) {
    return { message: "Dealer blackjack!", winnings: 0 };
  }

  if (playerHasNaturalBlackjack) {
    return { message: "Player blackjack!", winnings: 2.5 * hand.bet.hand };
  }

  if (playerValue > dealerValue || isBust(dealerHand)) {
    return { message: "Player wins!", winnings: 2 * hand.bet.hand };
  }

  if (playerValue === dealerValue) {
    return { message: "Push!", winnings: hand.bet.hand };
  }

  return { message: "Dealer wins!", winnings: 0 };
};

export const getWinnings = (
  playerHands: PlayerHand[],
  dealerHand: Card[],
  sideBetWinnings: number
) => {
  let winnings = sideBetWinnings;
  const results: string[] = [];
  const numberOfPlayers = playerHands.length;

  playerHands.forEach((hand) => {
    const result = getHandResult(hand, dealerHand);
    results.push(result.message);
    resultToast({
      message: result.message,
      winnings: result.winnings,
      numberOfPlayers,
    });
    winnings += result.winnings;
  });

  if (playerHands.length !== 1) {
    massToast({ winnings, details: results });
  }
  return winnings;
};
