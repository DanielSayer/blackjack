const suits = ["spades", "hearts", "diamonds", "clubs"] as const;
export type HandValue = string & { brand: "HandValue" };
export type Suit = (typeof suits)[number];
export type Card = {
  value: number;
  suit: Suit;
  rank: string;
  isHidden?: boolean;
};

const cardMappings = [
  { rank: "A", value: 1 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 10 },
  { rank: "Q", value: 10 },
  { rank: "K", value: 10 },
];

export function createDecks(numberOfDecks: number) {
  const deck: Card[] = [];
  for (let i = 0; i < numberOfDecks; i++) {
    for (const suit of suits) {
      for (const card of cardMappings) {
        deck.push({ rank: card.rank, value: card.value, suit: suit });
      }
    }
  }

  return deck;
}

export const shuffleDeck = (deck: Card[]): Card[] => {
  return deck.sort(() => Math.random() - 0.5);
};

export const getFileName = (card: Card) => {
  return `${card.rank}${card.suit[0].toUpperCase()}`;
};

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
    return "21" as HandValue;
  }

  if (aces > 0 && alternativeTotal <= 21) {
    return `${total}/${alternativeTotal}` as HandValue;
  }

  return `${total}` as HandValue;
};

export const minHandValue = (value: HandValue): number => {
  const [total] = value.split("/");
  return parseInt(total);
};

export const maxHandValue = (value: HandValue): number => {
  const [total, alternativeTotal] = value.split("/");

  if (alternativeTotal) {
    return parseInt(alternativeTotal);
  }
  return parseInt(total);
};
