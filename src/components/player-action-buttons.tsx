import { useBlackjackStore } from "@/stores/useBlackjackStore";
import { Button } from "./ui/button";

export const PlayerActionButtons = () => {
  const {
    playerHand,
    gameState,
    handlePlayerHit,
    handlePlayerStand,
    handlePlayAgain,
    handleDouble,
  } = useBlackjackStore();
  const isPlayerMove = gameState === "player-move";

  const canDouble = () => {
    return isPlayerMove && playerHand.length === 2;
  };

  const canSplit = () => {
    return (
      isPlayerMove &&
      playerHand.length === 2 &&
      playerHand[0].value === playerHand[1].value
    );
  };

  if (gameState === "settling-funds") {
    return (
      <div className="w-full flex justify-center mt-10">
        <Button onClick={handlePlayAgain}>Play Again</Button>
      </div>
    );
  }

  return (
    <div className="w-[500px] flex justify-between mt-10">
      <Button disabled={!isPlayerMove} onClick={handlePlayerStand}>
        Stand
      </Button>
      {canDouble() && (
        <Button disabled={!isPlayerMove} onClick={handleDouble}>
          Double
        </Button>
      )}
      {canSplit() && <Button disabled={!isPlayerMove}>Split</Button>}
      <Button disabled={!isPlayerMove} onClick={handlePlayerHit}>
        Hit
      </Button>
    </div>
  );
};
