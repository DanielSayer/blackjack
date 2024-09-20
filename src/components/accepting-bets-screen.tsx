import { chips, type Chips } from "@/lib/chips";
import { cn } from "@/lib/utils";
import {
  useBlackjackStore,
  type BettingType,
} from "@/stores/useBlackjackStore";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { toast } from "sonner";

export const AcceptingBetsScreen = () => {
  const {
    dealCards,
    bet,
    handlePlaceBet,
    lastBet,
    handleBetLast,
    handleClear,
  } = useBlackjackStore();
  const [selected, setSelected] = useState<BettingType | undefined>("hand");

  const handleClickOnBucket = (bet: BettingType) => {
    const bettingType = selected === bet ? undefined : bet;
    setSelected(bettingType);
  };

  const handleBet = (chip: Chips) => {
    if (!selected) return;
    const result = handlePlaceBet(selected, chip.value);
    if (!result.ok) {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="flex gap-4 min-h-32 items-center">
        <Button size="lg" className="invisible">
          Clear
        </Button>
        <Card
          className={cn("rounded-xl min-w-40 cursor-pointer", {
            "border-2 border-primary border-dashed": selected === "pairs",
          })}
          onClick={() => handleClickOnBucket("pairs")}
        >
          <CardHeader className="text-center">Pairs</CardHeader>
          <CardContent className="text-center">
            <p className="text-xl font-bold">${bet.pairs}</p>
          </CardContent>
          {lastBet && (
            <CardDescription className="text-center">
              Last bet: ${lastBet.pairs}
            </CardDescription>
          )}
        </Card>

        <Card
          className={cn("rounded-xl min-w-40 cursor-pointer", {
            "border-2 border-primary border-dashed": selected === "hand",
          })}
          onClick={() => handleClickOnBucket("hand")}
        >
          <CardHeader className="text-center">Hand</CardHeader>
          <CardContent className="text-center">
            <p className="text-xl font-bold">${bet.hand}</p>
          </CardContent>
          {lastBet && (
            <CardDescription className="text-center">
              Last bet: ${lastBet.hand}
            </CardDescription>
          )}
        </Card>

        <Card
          className={cn("rounded-xl min-w-40 cursor-pointer", {
            "border-2 border-primary border-dashed":
              selected === "threeCardPoker",
          })}
          onClick={() => handleClickOnBucket("threeCardPoker")}
        >
          <CardHeader className="text-center">21 + 3</CardHeader>
          <CardContent className="text-center">
            <p className="text-xl font-bold">${bet.threeCardPoker}</p>
          </CardContent>
          {lastBet && (
            <CardDescription className="text-center">
              Last bet: ${lastBet.threeCardPoker}
            </CardDescription>
          )}
        </Card>

        <Button size="lg" className="rounded-full" onClick={handleClear}>
          Clear
        </Button>
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
        {lastBet && (
          <Button
            variant="outline"
            className="rounded-full h-16"
            onClick={() => handleBetLast(lastBet)}
          >
            BET LAST
          </Button>
        )}
      </div>
      <Button size="lg" onClick={dealCards}>
        Deal
      </Button>
    </div>
  );
};
