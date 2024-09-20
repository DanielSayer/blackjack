import { calculateHandValue } from "@/lib/hands";
import { useBlackjackStore } from "@/stores/useBlackjackStore";
import { PlayerView } from "./player-view";
import { PlayingCard } from "./playing-card";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const InProgressScreen = () => {
  const { players, dealerHand } = useBlackjackStore();
  return (
    <div className="flex flex-col items-center justify-center -mt-40">
      <Card className="scale-75">
        <CardHeader>
          <CardTitle className="text-center">
            Dealer{" "}
            <span className="font-bold ms-2">
              ({calculateHandValue(dealerHand)})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          {dealerHand.map((card) => (
            <PlayingCard key={`${card.rank}-${card.suit}`} card={card} />
          ))}
        </CardContent>
      </Card>
      {players.map((player) => (
        <PlayerView key={player.id} player={player} />
      ))}
    </div>
  );
};
