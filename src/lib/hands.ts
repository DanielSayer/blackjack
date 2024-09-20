import type { Card } from "./cards";

export type HandValue = string & { brand: "HandValue" };

export const calculateHandValue = (hand: Card[]): HandValue => {
  let total = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (card.isHidden) {
      return;
    }

    if (card.rank === "A") {
      aces += 1;
    }

    total += card.value;
  });

  const alternativeTotal = total + (aces > 0 ? 10 : 0);
  if (total === 21 || alternativeTotal === 21) {
    if (hand.length === 2) {
      return "Blackjack!" as HandValue;
    }
    return "21" as HandValue;
  }

  if (aces > 0 && alternativeTotal <= 21) {
    return `${total}/${alternativeTotal}` as HandValue;
  }

  if (total > 21) {
    return `${total} BUST!` as HandValue;
  }

  return `${total}` as HandValue;
};

export const minHandValue = (value: HandValue): number => {
  const [total] = value.split("/");
  return parseInt(total);
};

export function maxHandValue(value: Card[]): number;
export function maxHandValue(value: HandValue): number;
export function maxHandValue(value: HandValue | Card[]): number {
  const handValue = Array.isArray(value) ? calculateHandValue(value) : value;
  const [total, alternativeTotal] = handValue.split("/");
  if (handValue === "Blackjack!") {
    return 21;
  }

  if (alternativeTotal) {
    return parseInt(alternativeTotal);
  }
  return parseInt(total);
}

export const isBust = (hand: Card[]) => {
  return minHandValue(calculateHandValue(hand)) > 21;
};

export const isBlackjack = (hand: Card[]) => {
  const unhiddenHand = hand.map((card) => ({ ...card, isHidden: false }));
  return maxHandValue(unhiddenHand) === 21 && unhiddenHand.length === 2;
};
