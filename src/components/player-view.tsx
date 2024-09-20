import { calculateHandValue } from "@/lib/hands";
import type { Player } from "@/stores/useBlackjackStore";
import { PlayerActionButtons } from "./player-action-buttons";
import { PlayingCard } from "./playing-card";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type PlayerViewProps = {
  player: Player;
};

export const PlayerView = ({ player }: PlayerViewProps) => {
  return (
    <>
      <Card className="scale-110">
        <CardHeader>
          <CardTitle className="text-center">
            Player {player.id + 1}
            <span className="font-bold ms-2">
              ({calculateHandValue(player.cards)})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-4">
            {player.cards.map((card) => (
              <PlayingCard key={`${card.rank}-${card.suit}`} card={card} />
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="mt-10 text-center">
        <div className="mb-2 font-semibold">Current Round Bets</div>
        <div className="flex gap-4 ">
          <Card className="p-4 w-32 text-center">
            <p className="font-bold">Pairs</p>
            <p>${player.bet.pairs}</p>
          </Card>
          <Card className="p-4 w-32 text-center">
            <p className="font-bold">Hand</p>
            <p>${player.bet.hand}</p>
          </Card>
          <Card className="p-4 w-32 text-center">
            <p className="font-bold">21 + 3</p>
            <p>${player.bet.threeCardPoker}</p>
          </Card>
        </div>
      </div>
      <PlayerActionButtons player={player} />
    </>
  );
};
