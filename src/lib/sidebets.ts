import { successToast } from "@/components/result-toast";
import { getCardColour, type Card } from "./cards";

const threeCardPoker = {
  nothing: null,
  flush: { name: "Flush", payout: "5:1" },
  straight: { name: "Straight", payout: "10:1" },
  threeOfAKind: { name: "Three of a Kind", payout: "30:1" },
  straightFlush: { name: "Straight Flush", payout: "40:1" },
  suitedThreeOfAKind: { name: "Suited Three of a Kind", payout: "100:1" },
};

const pairs = {
  noPair: null,
  mixedPair: { name: "Mixed Pair", payout: "5:1" },
  colouredPair: { name: "Coloured Pair", payout: "12:1" },
  perfectPair: { name: "Perfect Pair", payout: "30:1" },
};

export const handleDealEnd = (
  playerHand: Card[],
  dealerCard: Card,
  bet: { pair: number; threeCardPoker: number }
) => {
  let threeCardPokerPayout = 0;
  let pairPayout = 0;

  if (bet.pair > 0) {
    const pairResult = isPair(playerHand);
    if (pairResult) {
      pairPayout = getPayout(pairResult.payout, bet.pair);
      successToast({
        message: pairResult.name,
        winnings: pairPayout,
      });
    }
  }

  if (bet.threeCardPoker > 0) {
    const threeCardPokerResult = isThreeCardPoker(playerHand, dealerCard);

    if (threeCardPokerResult) {
      threeCardPokerPayout = getPayout(
        threeCardPokerResult.payout,
        bet.threeCardPoker
      );
      successToast({
        message: threeCardPokerResult.name,
        winnings: threeCardPokerPayout,
      });
    }
  }

  return threeCardPokerPayout + pairPayout;
};

function getPayout(ratio: string, bet: number) {
  const [odds] = ratio.split(":");
  const oddsNumber = parseInt(odds);
  const payout = bet * oddsNumber + bet;
  return payout;
}

function isPair(playerHand: Card[]) {
  if (playerHand.length !== 2) {
    throw new Error("Player hand must have exactly two cards");
  }

  const [firstCard, secondCard] = playerHand;
  const isSameRank = firstCard.rank === secondCard.rank;

  if (!isSameRank) {
    return pairs.noPair;
  }

  const isSameSuit = firstCard.suit === secondCard.suit;
  const isSameColour = getCardColour(firstCard) === getCardColour(secondCard);

  if (isSameSuit) {
    return pairs.perfectPair;
  }

  if (isSameColour) {
    return pairs.colouredPair;
  }

  return pairs.mixedPair;
}

function isThreeCardPoker(playerHand: Card[], dealerCard: Card) {
  if (playerHand.length !== 2) {
    throw new Error("Player hand must have exactly two cards");
  }

  const [firstCard, secondCard] = playerHand;

  const isFlush =
    firstCard.suit === secondCard.suit && firstCard.suit === dealerCard.suit;
  const isThreeOfAKind =
    firstCard.rank === secondCard.rank && firstCard.rank === dealerCard.rank;

  const isStraight = isAStraight(
    firstCard.index,
    secondCard.index,
    dealerCard.index
  );

  if (isThreeOfAKind && isFlush) {
    return threeCardPoker.suitedThreeOfAKind;
  }

  if (isStraight && isFlush) {
    return threeCardPoker.straightFlush;
  }

  if (isThreeOfAKind) {
    return threeCardPoker.threeOfAKind;
  }

  if (isStraight) {
    return threeCardPoker.straight;
  }

  if (isFlush) {
    return threeCardPoker.flush;
  }

  return threeCardPoker.nothing;
}

const isAStraight = (a: number, b: number, c: number) => {
  const sorted = [a, b, c].sort((a, b) => a - b);
  return sorted[0] + 1 === sorted[1] && sorted[1] + 1 === sorted[2];
};
