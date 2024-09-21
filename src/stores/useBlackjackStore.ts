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

const defaultBet = { hand: 0, pairs: 0, threeCardPoker: 0 };

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
  handlePlayerSplit: () => void;
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
          bet: defaultBet,
          previousBet: defaultBet,
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

    // Deal first card to each player
    for (const player of get().players) {
      const playerCardOne = await get().takeTopCard();
      set((state) => ({
        players: state.players.map((x) =>
          x.id === player.id ? { ...x, cards: [...x.cards, playerCardOne] } : x
        ),
      }));
    }

    // Deal first card to the dealer
    const dealerCardOne = await get().takeTopCard();
    set((state) => ({
      dealerHand: [...state.dealerHand, dealerCardOne],
    }));

    // Deal second card to each player
    for (const player of get().players) {
      const playerCardTwo = await get().takeTopCard();
      set((state) => ({
        players: state.players.map((x) =>
          x.id === player.id ? { ...x, cards: [...x.cards, playerCardTwo] } : x
        ),
      }));
    }

    // Handle side bet winnings for each player
    for (const player of get().players) {
      const bet = player.bet;
      const sideBetWinnings = handleDealEnd(player.cards, dealerCardOne, {
        pair: bet.pairs,
        threeCardPoker: bet.threeCardPoker,
      });
      set((state) => ({
        sideBetWinnings: state.sideBetWinnings + sideBetWinnings,
      }));
    }

    // Deal second card to the dealer and hide it
    const dealerCardTwo = await get().takeTopCard();
    set((state) => ({
      dealerHand: [...state.dealerHand, { ...dealerCardTwo, isHidden: true }],
      gameState: "player-move",
    }));

    // Check if the dealer has blackjack
    if (isBlackjack(get().dealerHand)) {
      set((state) => ({
        dealerHand: state.dealerHand.map((card) => ({
          ...card,
          isHidden: false,
        })),
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
      ...player,
      bet: defaultBet,
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
    let didBust = false;
    let canDouble = true;
    const updatedPlayers = playerHands.map(async (player) => {
      if (player.id === playerIndex) {
        betAmount = player.bet.hand;
        if (betAmount > get().playerBalance) {
          toast.error("Insufficient funds");
          canDouble = false;
          return player;
        }

        const newHand = [...player.cards, await get().takeTopCard()];
        if (isBust(newHand)) {
          didBust = true;
        }

        return {
          ...player,
          cards: newHand,
          bet: { ...player.bet, hand: betAmount * 2 },
        };
      }
      return player;
    });

    if (!canDouble) {
      return;
    }

    Promise.all(updatedPlayers).then((playerHands) => {
      set((state) => ({
        players: playerHands,
        playerBalance: state.playerBalance - betAmount,
      }));
      if (didBust) {
        get().handlePlayerBust();
      } else {
        get().handlePlayerStand();
      }
    });
  },

  handlePlayAgain: () => {
    set((state) => ({
      gameState: "accepting-bets",
      players: state.players.map((player) => ({
        ...player,
        cards: [],
        bet: defaultBet,
        previousBet: player.bet,
      })),
      dealerHand: [],
      playerTurn: 0,
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

  handlePlayerSplit: () => {
    const playerTurn = get().playerTurn;
    const players = get().players;
    let betAmount = 0;
    const newHand: Card[] = [];

    if (get().playerBalance < betAmount) {
      toast.error("Insufficient funds");
      return;
    }

    const newPlayers = players.map((player) => {
      if (player.id === playerTurn) {
        betAmount = player.bet.hand;
        newHand.push(player.cards[1]);
        return {
          ...player,
          cards: [player.cards[0]],
        };
      }
      return player;
    });

    set((state) => ({
      players: [
        ...newPlayers,
        {
          id: players.length,
          cards: [...newHand],
          bet: { hand: betAmount, pairs: 0, threeCardPoker: 0 },
          previousBet: defaultBet,
        },
      ],
      playerBalance: state.playerBalance - betAmount,
    }));
  },
}));
