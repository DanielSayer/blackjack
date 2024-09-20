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
  | "dealer-move"
  | "settling-funds";

export type Player = {
  id: number;
  cards: Card[];
  bet: Bet;
  previousBet: Bet;
};

export type BlackjackStore = {
  players: Player[];
  dealerHand: Card[];
  deck: Card[];
  playerBalance: number;
  sideBetWinnings: number;
  gameState: GameState;
  playerTurn: number;
  handleStartGame: () => void;
  takeTopCard: () => Promise<Card>;
  dealCards: () => Promise<void>;
  handlePlayerHit: () => Promise<void>;
  handlePlayerStand: () => Promise<void>;
  handleClear: () => void;
  handlePlayAgain: () => void;
  handleGameOver: () => void;
  handleDouble: (playerIndex: number) => void;
  handlePlayerBust: () => void;
  // handleBetLast: (lastBet: Bet) => void;
  handlePlaceBet: (
    bet: BettingType,
    amount: number,
    playerIndex: number
  ) => void;
};

export const useBlackjackStore = create<BlackjackStore>((set, get) => ({
  players: [],
  dealerHand: [],
  deck: [],
  gameState: "not-started",
  playerBalance: 0,
  playerTurn: 0,
  sideBetWinnings: 0,

  handleStartGame: () => {
    const deck = shuffleDeck(createDecks(8));
    set({
      players: [
        {
          id: 0,
          cards: [],
          bet: { hand: 0, pairs: 0, threeCardPoker: 0 },
          previousBet: { hand: 0, pairs: 0, threeCardPoker: 0 },
        },
      ],
      deck,
      gameState: "accepting-bets",
      playerBalance: 500,
    });
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
    const playerBet = get().players.map((hand) => hand.bet);
    const betAmount = playerBet.reduce((acc, bet) => acc + bet.hand, 0);

    if (betAmount === 0) {
      toast.error("Must place a bet before dealing cards");
      return;
    }

    get().players.forEach(async (player) => {
      const playerCardOne = await get().takeTopCard();
      set((state) => ({
        players: state.players.map((x) =>
          x.id === player.id ? { ...x, cards: [...x.cards, playerCardOne] } : x
        ),
      }));
    });

    const dealerCardOne = await get().takeTopCard();
    set((state) => ({
      dealerHand: [...state.dealerHand, dealerCardOne],
    }));

    get().players.forEach(async (player) => {
      const playerCardTwo = await get().takeTopCard();
      set((state) => ({
        players: state.players.map((x) =>
          x.id === player.id ? { ...x, cards: [...x.cards, playerCardTwo] } : x
        ),
      }));
    });

    get().players.forEach(async (hand) => {
      const bet = hand.bet;
      const sideBetWinnings = handleDealEnd(hand.cards, dealerCardOne, {
        pair: bet.pairs,
        threeCardPoker: bet.threeCardPoker,
      });
      set((state) => ({
        sideBetWinnings: state.sideBetWinnings + sideBetWinnings,
      }));
    });

    const dealerCardTwo = await get().takeTopCard();
    set((state) => ({
      dealerHand: [...state.dealerHand, { ...dealerCardTwo, isHidden: true }],
      gameState: "player-move",
    }));

    if (isBlackjack(get().dealerHand)) {
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
    let newHand: Card[] = [];
    const playerIndex = get().playerTurn;
    const newPlayerHands = get().players.map(async (player) => {
      if (player.id === playerIndex) {
        newHand = [...player.cards, await get().takeTopCard()];

        return { ...player, cards: newHand };
      }
      return player;
    });
    Promise.all(newPlayerHands).then((playerHands) => {
      set({ players: playerHands, gameState: "player-move" });

      if (isBust(newHand)) {
        get().handlePlayerBust();
      }

      if (maxHandValue(newHand) === 21) {
        get().handlePlayerStand();
      }
    });
  },

  // handleBetLast: () => {
  //   const hands = get().playerHands;
  //   const betAmount = hands.reduce(
  //     (acc, hand) =>
  //       acc + hand.bet.hand + hand.bet.pairs + hand.bet.threeCardPoker,
  //     0
  //   );
  //   const lastBet = get().lastBet;
  //   const lastBetAmount = lastBet.reduce(
  //     (acc, lastBet) =>
  //       acc + lastBet.bet.hand + lastBet.bet.pairs + lastBet.bet.threeCardPoker,
  //     0
  //   );

  //   const amountRequired = lastBetAmount - betAmount;

  //   if (amountRequired > get().playerBalance) {
  //     toast.error("Insufficient funds");
  //     return;
  //   }

  //   const newHands = lastBet.map((bet, index) => ({
  //     playerIndex: index,
  //     cards: [],
  //     bet: bet.bet,
  //   }));
  //   set((state) => ({
  //     playerHands: newHands,
  //     playerBalance: state.playerBalance - amountRequired,
  //   }));
  // },

  handleClear: () => {
    const hands = get().players;
    const betAmount = hands.reduce(
      (acc, hand) =>
        acc + hand.bet.hand + hand.bet.pairs + hand.bet.threeCardPoker,
      0
    );
    const newHands = hands.map((player) => ({
      id: player.id,
      cards: [],
      bet: { hand: 0, pairs: 0, threeCardPoker: 0 },
      previousBet: player.previousBet,
    }));

    set((state) => ({
      players: newHands,
      playerBalance: state.playerBalance + betAmount,
    }));
  },

  handlePlayerStand: async () => {
    if (get().players.length - 1 !== get().playerTurn) {
      set((state) => ({
        playerTurn: state.playerTurn + 1,
        gameState: "player-move",
      }));
      return;
    }
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

  handleDouble: (playerIndex: number) => {
    const playerHands = get().players;
    let betAmount = 0;
    const newHands = playerHands.map((player) => {
      if (player.id === playerIndex) {
        betAmount = player.bet.hand;
        if (betAmount > get().playerBalance) {
          toast.error("Insufficient funds");
          return player;
        }

        return {
          ...player,
          bet: { ...player.bet, hand: betAmount * 2 },
        };
      }
      return player;
    });

    set((state) => ({
      players: newHands,
      playerBalance: state.playerBalance - betAmount,
    }));

    const newPlayerHands = get().players.map(async (player) => {
      if (player.id === playerIndex) {
        const newHand = [...player.cards, await get().takeTopCard()];

        if (isBust(newHand)) {
          get().handlePlayerBust();
        }

        return { ...player, cards: newHand };
      }
      return player;
    });
    Promise.all(newPlayerHands).then((playerHands) => {
      set({ players: playerHands, gameState: "player-move" });
    });
    get().handlePlayerStand();
  },

  handlePlayAgain: () => {
    set((state) => ({
      gameState: "accepting-bets",
      players: state.players.map((player) => ({
        ...player,
        cards: [],
        bet: { hand: 0, pairs: 0, threeCardPoker: 0 },
        previousBet: player.bet,
      })),
      dealerHand: [],
    }));
  },

  handlePlaceBet: (bet: BettingType, amount: number, playerIndex: number) => {
    if (get().playerBalance < amount) {
      toast.error("Insufficient funds");
      return;
    }
    const newHands = get().players.map((player) => {
      if (player.id === playerIndex) {
        return {
          ...player,
          bet: {
            ...player.bet,
            [bet]: player.bet[bet] + amount,
          },
        };
      }
      return player;
    });

    set((state) => ({
      players: newHands,
      playerBalance: state.playerBalance - amount,
    }));
  },

  handlePlayerBust: () => {
    if (get().playerTurn < get().players.length - 1) {
      set((state) => ({
        playerTurn: state.playerTurn + 1,
        gameState: "player-move",
      }));
      return;
    }
    set((state) => ({
      dealerHand: [
        ...state.dealerHand.map((card) => ({ ...card, isHidden: false })),
      ],
    }));
    get().handleGameOver();
  },

  handleGameOver: () => {
    const playerWinnings = getWinnings(
      get().players,
      get().dealerHand,
      get().sideBetWinnings
    );
    set((state) => ({
      gameState: "settling-funds",
      playerBalance: state.playerBalance + playerWinnings,
    }));
  },
}));
