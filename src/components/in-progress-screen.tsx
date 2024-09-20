import { useBlackjackStore } from "@/stores/useBlackjackStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PlayingCard } from "./playing-card";
import { PlayerActionButtons } from "./player-action-buttons";
import { calculateHandValue } from "@/lib/hands";

export const InProgressScreen = () => {
  const { playerHand, dealerHand, bet } = useBlackjackStore();
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
      <Card className="scale-110">
        <CardHeader>
          <CardTitle className="text-center">
            Player
            <span className="font-bold ms-2">
              ({calculateHandValue(playerHand)})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-4">
            {playerHand.map((card) => (
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
            <p>${bet.pairs}</p>
          </Card>
          <Card className="p-4 w-32 text-center">
            <p className="font-bold">Hand</p>
            <p>${bet.hand}</p>
          </Card>
          <Card className="p-4 w-32 text-center">
            <p className="font-bold">21 + 3</p>
            <p>${bet.threeCardPoker}</p>
          </Card>
        </div>
      </div>
      <PlayerActionButtons />
    </div>
  );
};
