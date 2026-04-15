import { describe, expect, it, vi } from "vitest";
import type { Card, Suit } from "./cards";
import { handleDealEnd } from "./sidebets";

vi.mock("@/components/result-toast", () => ({
  successToast: vi.fn(),
}));

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

describe("handleDealEnd", () => {
  it("pays mixed, coloured, and perfect pairs at the configured odds", () => {
    expect(
      handleDealEnd(
        [card("7", 7, 6, "hearts"), card("7", 7, 6, "clubs")],
        card("2", 2, 1),
        { pair: 10, threeCardPoker: 0 }
      )
    ).toBe(60);

    expect(
      handleDealEnd(
        [card("7", 7, 6, "hearts"), card("7", 7, 6, "diamonds")],
        card("2", 2, 1),
        { pair: 10, threeCardPoker: 0 }
      )
    ).toBe(130);

    expect(
      handleDealEnd(
        [card("7", 7, 6, "hearts"), card("7", 7, 6, "hearts")],
        card("2", 2, 1),
        { pair: 10, threeCardPoker: 0 }
      )
    ).toBe(310);
  });

  it("pays 21 + 3 flush, straight, trips, straight flush, and suited trips", () => {
    expect(
      handleDealEnd(
        [card("2", 2, 1, "hearts"), card("7", 7, 6, "hearts")],
        card("K", 10, 12, "hearts"),
        { pair: 0, threeCardPoker: 10 }
      )
    ).toBe(60);

    expect(
      handleDealEnd(
        [card("5", 5, 4, "hearts"), card("6", 6, 5, "clubs")],
        card("7", 7, 6, "diamonds"),
        { pair: 0, threeCardPoker: 10 }
      )
    ).toBe(110);

    expect(
      handleDealEnd(
        [card("9", 9, 8, "hearts"), card("9", 9, 8, "clubs")],
        card("9", 9, 8, "diamonds"),
        { pair: 0, threeCardPoker: 10 }
      )
    ).toBe(310);

    expect(
      handleDealEnd(
        [card("5", 5, 4, "hearts"), card("6", 6, 5, "hearts")],
        card("7", 7, 6, "hearts"),
        { pair: 0, threeCardPoker: 10 }
      )
    ).toBe(410);

    expect(
      handleDealEnd(
        [card("9", 9, 8, "hearts"), card("9", 9, 8, "hearts")],
        card("9", 9, 8, "hearts"),
        { pair: 0, threeCardPoker: 10 }
      )
    ).toBe(1010);
  });

  it("returns zero for losing side bets", () => {
    expect(
      handleDealEnd(
        [card("2", 2, 1, "hearts"), card("8", 8, 7, "clubs")],
        card("K", 10, 12, "diamonds"),
        { pair: 10, threeCardPoker: 10 }
      )
    ).toBe(0);
  });
});
