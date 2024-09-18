import { calculateHandValue } from "@/lib/cards";
import { useGameStore } from "@/stores/useGameStore";
import { GameButtons } from "./game-buttons";
import { PlayingCard } from "./playing-card";
import { Button } from "./ui/button";

export const Game = () => {
  const { playerCards, dealerCards, deck, dealCards } = useGameStore();
  return (
    <div>
      Game is active with {deck.length} cards
      <div>
        <Button onClick={dealCards}>Deal</Button>
      </div>
      <div>
        <h2>Player Cards</h2>
        <div>
          Score{" "}
          <span className="font-bold">{calculateHandValue(playerCards)}</span>
        </div>
        <div className="flex gap-4">
          {playerCards.map((card) => (
            <PlayingCard key={`${card.rank}-${card.suit}`} card={card} />
          ))}
        </div>
        <GameButtons />
      </div>
      <div>
        <h2>Dealer Cards</h2>
        <div>
          Score{" "}
          <span className="font-bold">{calculateHandValue(dealerCards)}</span>
        </div>
        <div className="flex gap-4">
          {dealerCards.map((card) => (
            <PlayingCard key={`${card.rank}-${card.suit}`} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};
