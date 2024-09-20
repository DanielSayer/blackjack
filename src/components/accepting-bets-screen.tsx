import { chips, type Chips } from "@/lib/chips";
import { cn } from "@/lib/utils";
import {
  useBlackjackStore,
  type BettingType,
} from "@/stores/useBlackjackStore";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

export const AcceptingBetsScreen = () => {
  const { dealCards, players, handlePlaceBet, handleClear } =
    useBlackjackStore();
  const [selected, setSelected] = useState<{
    id: number;
    bucket: BettingType | undefined;
  }>({ id: 0, bucket: "hand" });

  const handleClickOnBucket = (id: number, bet: BettingType) => {
    const bettingType = selected.bucket === bet ? undefined : bet;
    setSelected({ id, bucket: bettingType });
  };

  const handleBet = (chip: Chips) => {
    if (!selected.bucket) return;
    handlePlaceBet(selected.bucket, chip.value, selected.id);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="flex gap-4">
        {players.map((player) => (
          <div className="flex gap-4 min-h-32 items-center" key={player.id}>
            <Button size="lg" className="invisible">
              Clear
            </Button>
            <Card
              className={cn("rounded-xl min-w-40 cursor-pointer", {
                "border-2 border-primary border-dashed":
                  selected.id === player.id && selected.bucket === "pairs",
              })}
              onClick={() => handleClickOnBucket(player.id, "pairs")}
            >
              <CardHeader className="text-center">Pairs</CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-bold">${player.bet.pairs}</p>
              </CardContent>
              <CardDescription className="text-center">
                Last bet: ${player.previousBet.pairs}
              </CardDescription>
            </Card>

            <Card
              className={cn("rounded-xl min-w-40 cursor-pointer", {
                "border-2 border-primary border-dashed":
                  selected.id === player.id && selected.bucket === "hand",
              })}
              onClick={() => handleClickOnBucket(player.id, "hand")}
            >
              <CardHeader className="text-center">Hand</CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-bold">${player.bet.hand}</p>
              </CardContent>
              <CardDescription className="text-center">
                Last bet: ${player.previousBet.hand}
              </CardDescription>
            </Card>

            <Card
              className={cn("rounded-xl min-w-40 cursor-pointer", {
                "border-2 border-primary border-dashed":
                  selected.id === player.id &&
                  selected.bucket === "threeCardPoker",
              })}
              onClick={() => handleClickOnBucket(player.id, "threeCardPoker")}
            >
              <CardHeader className="text-center">21 + 3</CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-bold">
                  ${player.bet.threeCardPoker}
                </p>
              </CardContent>
              <CardDescription className="text-center">
                Last bet: ${player.previousBet.threeCardPoker}
              </CardDescription>
            </Card>

            <Button size="lg" className="rounded-full" onClick={handleClear}>
              Clear
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        {chips.map((chip) => (
          <Button
            key={chip.value}
            variant="outline"
            className={`rounded-full h-16 w-16 bg-gradient-to-r from-${chip.colour}-400 to-${chip.colour}-800  border-${chip.colour}-900`}
            onClick={() => handleBet(chip)}
          >
            {chip.display}
          </Button>
        ))}
        <Button variant="outline" className="rounded-full h-16">
          BET LAST
        </Button>
      </div>
      <Button size="lg" onClick={dealCards}>
        Deal
      </Button>
    </div>
  );
};
