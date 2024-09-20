const suits = ["spades", "hearts", "diamonds", "clubs"] as const;
export type Suit = (typeof suits)[number];
export type Card = {
  value: number;
  suit: Suit;
  rank: string;
  index: number;
  isHidden?: boolean;
};

const cardMappings = [
  { rank: "2", value: 2, index: 1 },
  { rank: "3", value: 3, index: 2 },
  { rank: "4", value: 4, index: 3 },
  { rank: "5", value: 5, index: 4 },
  { rank: "6", value: 6, index: 5 },
  { rank: "7", value: 7, index: 6 },
  { rank: "8", value: 8, index: 7 },
  { rank: "9", value: 9, index: 8 },
  { rank: "10", value: 10, index: 9 },
  { rank: "J", value: 10, index: 10 },
  { rank: "Q", value: 10, index: 11 },
  { rank: "K", value: 10, index: 12 },
  { rank: "A", value: 1, index: 13 },
];

export function getCardColour(card: Card): "black" | "red" {
  if (card.suit === "spades" || card.suit === "clubs") {
    return "black";
  }
  return "red";
}

export function createDecks(numberOfDecks: number) {
  const deck: Card[] = [];
  for (let i = 0; i < numberOfDecks; i++) {
    for (const suit of suits) {
      for (const card of cardMappings) {
        deck.push({
          rank: card.rank,
          value: card.value,
          suit: suit,
          index: card.index,
        });
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
