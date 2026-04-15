import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Card, Suit } from "@/lib/cards";
import { useBlackjackStore, type Bet, type Player } from "./useBlackjackStore";

const { toastError } = vi.hoisted(() => ({
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastError,
  },
}));

vi.mock("@/components/result-toast", () => ({
  massToast: vi.fn(),
  resultToast: vi.fn(),
  successToast: vi.fn(),
}));

const emptyBet = (): Bet => ({
  hand: 0,
  pairs: 0,
  threeCardPoker: 0,
});

const bet = (values: Partial<Bet> = {}): Bet => ({
  ...emptyBet(),
  ...values,
});

const card = (
  rank: string,
  value: number,
  index: number,
  suit: Suit = "spades"
): Card => ({
  rank,
  value,
  index,
  suit,
});

const player = (overrides: Partial<Player> = {}): Player => ({
  id: 0,
  cards: [],
  bet: emptyBet(),
  previousBet: emptyBet(),
  roundStartingBet: emptyBet(),
  ...overrides,
});

const resetStore = () => {
  useBlackjackStore.setState({
    players: [player()],
    dealerHand: [],
    deck: [],
    playerBalance: 500,
    sideBetWinnings: 0,
    gameState: "accepting-bets",
    playerTurn: 0,
  });
  toastError.mockClear();
};

describe("useBlackjackStore betting", () => {
  beforeEach(resetStore);

  it("BET LAST replaces current bets and refunds current chips first", () => {
    useBlackjackStore.setState({
      playerBalance: 450,
      players: [
        player({
          bet: bet({ hand: 50 }),
          previousBet: bet({ hand: 25, pairs: 5, threeCardPoker: 10 }),
        }),
      ],
    });

    useBlackjackStore.getState().handleBetLast();

    const state = useBlackjackStore.getState();
    expect(state.players[0].bet).toEqual({
      hand: 25,
      pairs: 5,
      threeCardPoker: 10,
    });
    expect(state.playerBalance).toBe(460);
  });

  it("BET LAST does not change bets when there is no previous bet", () => {
    useBlackjackStore.setState({
      playerBalance: 500,
      players: [player()],
    });

    useBlackjackStore.getState().handleBetLast();

    const state = useBlackjackStore.getState();
    expect(state.players[0].bet).toEqual(emptyBet());
    expect(state.playerBalance).toBe(500);
    expect(toastError).toHaveBeenCalledWith("No previous bet to repeat");
  });

  it("BET LAST does not change bets when the refunded balance cannot cover it", () => {
    useBlackjackStore.setState({
      playerBalance: 10,
      players: [
        player({
          bet: bet({ hand: 5 }),
          previousBet: bet({ hand: 20 }),
        }),
      ],
    });

    useBlackjackStore.getState().handleBetLast();

    const state = useBlackjackStore.getState();
    expect(state.players[0].bet).toEqual(bet({ hand: 5 }));
    expect(state.playerBalance).toBe(10);
    expect(toastError).toHaveBeenCalledWith("Insufficient funds");
  });
});

describe("useBlackjackStore settlement lifecycle", () => {
  beforeEach(resetStore);

  it("stores the original round bet as the last bet after a double", () => {
    useBlackjackStore.setState({
      gameState: "settling-funds",
      players: [
        player({
          bet: bet({ hand: 20 }),
          roundStartingBet: bet({ hand: 10 }),
        }),
      ],
    });

    useBlackjackStore.getState().handlePlayAgain();

    const state = useBlackjackStore.getState();
    expect(state.players[0].bet).toEqual(emptyBet());
    expect(state.players[0].previousBet).toEqual(bet({ hand: 10 }));
  });

  it("collapses split hands before the next betting round", () => {
    useBlackjackStore.setState({
      gameState: "settling-funds",
      players: [
        player({
          id: 0,
          bet: bet({ hand: 10 }),
          roundStartingBet: bet({ hand: 10 }),
        }),
        player({
          id: 1,
          bet: bet({ hand: 10 }),
          roundStartingBet: bet({ hand: 10 }),
          isSplitHand: true,
        }),
      ],
    });

    useBlackjackStore.getState().handlePlayAgain();

    const state = useBlackjackStore.getState();
    expect(state.players).toHaveLength(1);
    expect(state.players[0].id).toBe(0);
    expect(state.players[0].previousBet).toEqual(bet({ hand: 10 }));
  });

  it("resets side-bet winnings after settlement so they cannot leak into another round", () => {
    useBlackjackStore.setState({
      playerBalance: 100,
      sideBetWinnings: 50,
      players: [
        player({
          cards: [card("10", 10, 9), card("8", 8, 7)],
          bet: bet({ hand: 10 }),
        }),
      ],
      dealerHand: [card("10", 10, 9, "hearts"), card("9", 9, 8, "clubs")],
    });

    useBlackjackStore.getState().handleGameOver();

    const state = useBlackjackStore.getState();
    expect(state.playerBalance).toBe(150);
    expect(state.sideBetWinnings).toBe(0);
  });
});

describe("useBlackjackStore splitting", () => {
  beforeEach(resetStore);

  it("does not split when the balance cannot cover the duplicate hand bet", () => {
    useBlackjackStore.setState({
      playerBalance: 5,
      players: [
        player({
          cards: [card("8", 8, 7), card("8", 8, 7, "hearts")],
          bet: bet({ hand: 10 }),
        }),
      ],
    });

    useBlackjackStore.getState().handlePlayerSplit();

    const state = useBlackjackStore.getState();
    expect(state.players).toHaveLength(1);
    expect(state.playerBalance).toBe(5);
    expect(toastError).toHaveBeenCalledWith("Insufficient funds");
  });

  it("splits when the balance can cover the duplicate hand bet", () => {
    useBlackjackStore.setState({
      playerBalance: 20,
      players: [
        player({
          cards: [card("8", 8, 7), card("8", 8, 7, "hearts")],
          bet: bet({ hand: 10 }),
          roundStartingBet: bet({ hand: 10 }),
        }),
      ],
    });

    useBlackjackStore.getState().handlePlayerSplit();

    const state = useBlackjackStore.getState();
    expect(state.players).toHaveLength(2);
    expect(state.players[0].cards).toHaveLength(1);
    expect(state.players[1].cards).toEqual([card("8", 8, 7, "hearts")]);
    expect(state.players[1].isSplitHand).toBe(true);
    expect(state.playerBalance).toBe(10);
  });
});
