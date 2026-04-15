import { describe, expect, it, vi } from "vitest";
import type { Card, Suit } from "./cards";
import { getHandResult, getWinnings } from "./results";
import type { Bet } from "@/stores/useBlackjackStore";

vi.mock("@/components/result-toast", () => ({
  massToast: vi.fn(),
  resultToast: vi.fn(),
}));

const bet = (hand: number): Bet => ({
  hand,
  pairs: 0,
  threeCardPoker: 0,
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

const hand = (...cards: Card[]) => cards;

describe("getHandResult", () => {
  it("pays stake plus profit for a regular player win", () => {
    const result = getHandResult(
      { cards: hand(card("10", 10, 9), card("9", 9, 8)), bet: bet(10) },
      hand(card("10", 10, 9, "hearts"), card("8", 8, 7, "clubs"))
    );

    expect(result).toEqual({ message: "Player wins!", winnings: 20 });
  });

  it("returns the stake for a push", () => {
    const result = getHandResult(
      { cards: hand(card("10", 10, 9), card("8", 8, 7)), bet: bet(10) },
      hand(card("Q", 10, 11, "hearts"), card("8", 8, 7, "clubs"))
    );

    expect(result).toEqual({ message: "Push!", winnings: 10 });
  });

  it("pays blackjack at stake plus 3:2 profit", () => {
    const result = getHandResult(
      { cards: hand(card("A", 1, 13), card("K", 10, 12)), bet: bet(10) },
      hand(card("10", 10, 9, "hearts"), card("8", 8, 7, "clubs"))
    );

    expect(result).toEqual({ message: "Player blackjack!", winnings: 25 });
  });

  it("pushes when both player and dealer have blackjack", () => {
    const result = getHandResult(
      { cards: hand(card("A", 1, 13), card("K", 10, 12)), bet: bet(10) },
      hand(card("A", 1, 13, "hearts"), card("Q", 10, 11, "clubs"))
    );

    expect(result).toEqual({ message: "Push!", winnings: 10 });
  });

  it("dealer blackjack beats non-blackjack hands", () => {
    const result = getHandResult(
      { cards: hand(card("10", 10, 9), card("9", 9, 8)), bet: bet(10) },
      hand(card("A", 1, 13, "hearts"), card("Q", 10, 11, "clubs"))
    );

    expect(result).toEqual({ message: "Dealer blackjack!", winnings: 0 });
  });

  it("pays normal wins against a dealer bust", () => {
    const result = getHandResult(
      { cards: hand(card("10", 10, 9), card("6", 6, 5)), bet: bet(10) },
      hand(
        card("10", 10, 9, "hearts"),
        card("9", 9, 8, "clubs"),
        card("5", 5, 4, "diamonds")
      )
    );

    expect(result).toEqual({ message: "Player wins!", winnings: 20 });
  });

  it("treats a split two-card 21 as a normal win", () => {
    const result = getHandResult(
      {
        cards: hand(card("A", 1, 13), card("K", 10, 12)),
        bet: bet(10),
        isSplitHand: true,
      },
      hand(card("10", 10, 9, "hearts"), card("Q", 10, 11, "clubs"))
    );

    expect(result).toEqual({ message: "Player wins!", winnings: 20 });
  });

  it("uses the active doubled wager when settling a double down", () => {
    const result = getHandResult(
      { cards: hand(card("10", 10, 9), card("9", 9, 8)), bet: bet(20) },
      hand(card("10", 10, 9, "hearts"), card("8", 8, 7, "clubs"))
    );

    expect(result).toEqual({ message: "Player wins!", winnings: 40 });
  });
});

describe("getWinnings", () => {
  it("adds side-bet winnings to hand settlement once", () => {
    const winnings = getWinnings(
      [{ cards: hand(card("10", 10, 9), card("9", 9, 8)), bet: bet(10) }],
      hand(card("10", 10, 9, "hearts"), card("8", 8, 7, "clubs")),
      12
    );

    expect(winnings).toBe(32);
  });
});
