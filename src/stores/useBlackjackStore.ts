import { createDecks, shuffleDeck, type Card } from "@/lib/cards";
import {
  calculateHandValue,
  isBlackjack,
  isBust,
  maxHandValue,
} from "@/lib/hands";
import { getWinnings } from "@/lib/results";
import { handleDealEnd } from "@/lib/sidebets";
import { delay } from "@/lib/utils";
import { toast } from "sonner";
import { create } from "zustand";

export type BettingType = "pairs" | "hand" | "threeCardPoker";
export type Bet = Record<BettingType, number>;
export type GameState =
  | "not-started"
  | "accepting-bets"
  | "dealing-cards"
  | "player-move"
  | "dealer-move";

export type BlackjackStore = {
  playerHand: Card[];
  dealerHand: Card[];
  deck: Card[];
  playerBalance: number;
  sideBetWinnings: number;
  gameState:
    | "not-started"
    | "accepting-bets"
    | "dealing-cards"
    | "player-move"
    | "dealer-move"
    | "settling-funds";
  bet: Bet;
  lastBet: Bet | null;
  handleStartGame: () => void;
  takeTopCard: () => Promise<Card>;
  dealCards: () => Promise<void>;
  handlePlayerHit: () => Promise<void>;
  handlePlayerStand: () => Promise<void>;
  handleClear: () => void;
  handlePlayAgain: () => void;
  handleGameOver: () => void;
  handleDouble: () => void;
  handlePlayerBust: () => void;
  handleBetLast: (lastBet: Bet) => void;
  handlePlaceBet: (
    bet: BettingType,
    amount: number
  ) => { ok: boolean; error?: string };
};

export const useBlackjackStore = create<BlackjackStore>((set, get) => ({
  playerHand: [],
  dealerHand: [],
  deck: [],
  gameState: "not-started",
  playerBalance: 0,
  bet: {
    hand: 0,
    pairs: 0,
    threeCardPoker: 0,
  },
  lastBet: null,
  sideBetWinnings: 0,

  handleStartGame: () => {
    const deck = shuffleDeck(createDecks(8));
    set({ deck, gameState: "accepting-bets", playerBalance: 100 });
  },

  takeTopCard: async () => {
    set({ gameState: "dealing-cards" });
    await delay(1000);
    const topCard = get().deck.pop();
    if (!topCard) {
      throw new Error("No cards left in the deck");
    }

    set({ deck: [...get().deck] });
    return topCard;
  },

  dealCards: async () => {
    const playerBet = get().bet;
    const betAmount =
      playerBet.hand + playerBet.pairs + playerBet.threeCardPoker;

    if (betAmount === 0) {
      toast.error("Must place a bet before dealing cards");
      return;
    }

    const playerCardOne = await get().takeTopCard();
    set((state) => ({
      playerHand: [...state.playerHand, playerCardOne],
    }));

    const dealerCardOne = await get().takeTopCard();
    set((state) => ({
      dealerHand: [...state.dealerHand, dealerCardOne],
    }));

    const playerCardTwo = await get().takeTopCard();
    set((state) => ({
      playerHand: [...state.playerHand, playerCardTwo],
    }));

    const bet = get().bet;
    const sideBetWinnings = handleDealEnd(get().playerHand, dealerCardOne, {
      pair: bet.pairs,
      threeCardPoker: bet.threeCardPoker,
    });

    const dealerCardTwo = await get().takeTopCard();
    set((state) => ({
      dealerHand: [...state.dealerHand, { ...dealerCardTwo, isHidden: true }],
      gameState: "player-move",
      sideBetWinnings,
    }));

    if (isBlackjack(get().dealerHand) || isBlackjack(get().playerHand)) {
      set((state) => ({
        dealerHand: [
          ...state.dealerHand.map((card) => ({ ...card, isHidden: false })),
        ],
        gameState: "dealer-move",
      }));
      get().handleGameOver();
    }
  },

  handlePlayerHit: async () => {
    const newHand = [...get().playerHand, await get().takeTopCard()];
    set({ playerHand: newHand });
    if (isBust(newHand)) {
      get().handlePlayerBust();
      return;
    }
    if (maxHandValue(newHand) === 21) {
      get().handlePlayerStand();
    }
    set({ gameState: "player-move" });
  },

  handleBetLast: (lastBet: Bet) => {
    const bet = get().bet;
    const betAmount = bet.hand + bet.pairs + bet.threeCardPoker;
    const lastBetAmount = lastBet.hand + lastBet.pairs + lastBet.threeCardPoker;

    const amountRequired = lastBetAmount - betAmount;

    if (amountRequired > get().playerBalance) {
      toast.error("Insufficient funds");
      return;
    }
    set((state) => ({
      bet: lastBet,
      playerBalance: state.playerBalance - amountRequired,
    }));
  },

  handleClear: () => {
    const bet = get().bet;
    const betAmount = bet.hand + bet.pairs + bet.threeCardPoker;

    set((state) => ({
      bet: { hand: 0, pairs: 0, threeCardPoker: 0 },
      playerBalance: state.playerBalance + betAmount,
    }));
  },

  handlePlayerStand: async () => {
    set((state) => ({
      dealerHand: [
        ...state.dealerHand.map((card) => ({ ...card, isHidden: false })),
      ],
      gameState: "dealer-move",
    }));
    while (maxHandValue(calculateHandValue(get().dealerHand)) < 17) {
      const newHand = [...get().dealerHand, await get().takeTopCard()];
      set({ dealerHand: newHand });
    }
    get().handleGameOver();
  },

  handleDouble: async () => {
    const bet = get().bet;
    const betAmount = bet.hand + bet.pairs + bet.threeCardPoker;

    if (betAmount > get().playerBalance) {
      toast.error("Insufficient funds");
      return;
    }

    set((state) => ({
      bet: { ...state.bet, hand: state.bet.hand + bet.hand },
      playerBalance: state.playerBalance - betAmount,
    }));

    const newHand = [...get().playerHand, await get().takeTopCard()];
    set({ playerHand: newHand });
    if (isBust(newHand)) {
      get().handlePlayerBust();
      return;
    }

    get().handlePlayerStand();
  },

  handlePlayAgain: () => {
    set({
      gameState: "accepting-bets",
      playerHand: [],
      dealerHand: [],
      bet: { hand: 0, pairs: 0, threeCardPoker: 0 },
    });
  },

  handlePlaceBet: (bet: BettingType, amount: number) => {
    if (get().playerBalance < amount) {
      return { ok: false, error: "Insufficient funds" };
    }

    set((state) => ({
      bet: {
        ...state.bet,
        [bet]: state.bet[bet] + amount,
      },
      playerBalance: state.playerBalance - amount,
    }));

    return { ok: true };
  },

  handlePlayerBust: () => {
    set((state) => ({
      dealerHand: [
        ...state.dealerHand.map((card) => ({ ...card, isHidden: false })),
      ],
    }));
    get().handleGameOver();
  },

  handleGameOver: () => {
    const playerWinnings = getWinnings(
      get().playerHand,
      get().dealerHand,
      get().bet.hand,
      get().sideBetWinnings
    );
    set((state) => ({
      gameState: "settling-funds",
      playerBalance: state.playerBalance + playerWinnings,
      lastBet: state.bet,
    }));
  },
}));
