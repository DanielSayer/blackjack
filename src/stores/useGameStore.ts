import {
  calculateHandValue,
  createDecks,
  maxHandValue,
  minHandValue,
  shuffleDeck,
  type Card,
} from "@/lib/cards";
import { create } from "zustand";

type GameStore = {
  deck: Card[];
  playerCards: Card[];
  dealerCards: Card[];
  isGameStarted: boolean;
  isGameOver: boolean;
  isDealing: boolean;
  startGame: () => void;
  dealCards: () => Promise<void>;
  takeTopCard: () => Promise<Card>;
  isBust: (hand: Card[]) => boolean;
  handlePlayerHit: () => Promise<void>;
  handlePlayerStand: () => Promise<void>;
  handlePlayAgain: () => void;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useGameStore = create<GameStore>((set, get) => ({
  deck: [],
  playerCards: [],
  dealerCards: [],
  isGameStarted: false,
  isGameOver: false,
  isDealing: false,

  startGame: () => {
    const deck = shuffleDeck(createDecks(8));
    set({ deck, isGameStarted: true });
  },

  takeTopCard: async () => {
    set({ isDealing: true });
    await delay(1000);
    const topCard = get().deck.pop();
    if (!topCard) {
      throw new Error("No cards left in the deck");
    }

    set({ deck: [...get().deck], isDealing: false });
    return topCard;
  },

  dealCards: async () => {
    set({ isDealing: true });
    const playerCardOne = await get().takeTopCard();
    set((state) => ({
      playerCards: [...state.playerCards, playerCardOne],
    }));

    const dealerCardOne = await get().takeTopCard();
    set((state) => ({
      dealerCards: [...state.dealerCards, dealerCardOne],
    }));

    const playerCardTwo = await get().takeTopCard();
    set((state) => ({
      playerCards: [...state.playerCards, playerCardTwo],
    }));

    const dealerCardTwo = await get().takeTopCard();
    set((state) => ({
      dealerCards: [...state.dealerCards, { ...dealerCardTwo, isHidden: true }],
    }));

    set({ isDealing: false });
  },

  isBust: (hand: Card[]) => {
    return minHandValue(calculateHandValue(hand)) > 21;
  },

  handlePlayerHit: async () => {
    const newHand = [...get().playerCards, await get().takeTopCard()];

    if (get().isBust(newHand)) {
      set({ isGameOver: true });
    }

    set({ playerCards: newHand });
  },

  handlePlayerStand: async () => {
    set((state) => ({
      dealerCards: [
        ...state.dealerCards.map((card) => ({ ...card, isHidden: false })),
      ],
    }));

    while (maxHandValue(calculateHandValue(get().dealerCards)) < 17) {
      const newHand = [...get().dealerCards, await get().takeTopCard()];
      set({ dealerCards: newHand });
    }

    set({ isGameOver: true });
  },

  handlePlayAgain: () => {
    set({ isGameOver: false, playerCards: [], dealerCards: [] });
  },
}));
