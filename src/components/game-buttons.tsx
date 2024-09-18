import { useGameStore } from "@/stores/useGameStore";
import { Button } from "./ui/button";

export const GameButtons = () => {
  const {
    isDealing,
    isGameOver,
    handlePlayerHit,
    handlePlayerStand,
    handlePlayAgain,
  } = useGameStore();

  if (isGameOver) {
    return (
      <div className="flex gap-4">
        <Button onClick={handlePlayAgain}>Play Again</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Button onClick={handlePlayerHit} disabled={isDealing}>
        Hit
      </Button>

      <Button onClick={handlePlayerStand} disabled={isDealing}>
        Stand
      </Button>
    </div>
  );
};
