import { useBlackjackStore, type Player } from "@/stores/useBlackjackStore";
import { Button } from "./ui/button";

type PlayerActionButtonsProps = {
  player: Player;
};

export const PlayerActionButtons = ({ player }: PlayerActionButtonsProps) => {
  const {
    playerTurn,
    gameState,
    handlePlayerHit,
    handlePlayerStand,
    handlePlayAgain,
    handleDouble,
  } = useBlackjackStore();
  const isCurrentPlayer = playerTurn === player.id;
  const isPlayerMove = gameState === "player-move" && isCurrentPlayer;

  const canDouble = () => {
    return isCurrentPlayer && player.cards.length === 2;
  };

  const canSplit = () => {
    return (
      isCurrentPlayer &&
      player.cards.length === 2 &&
      player.cards[0].value === player.cards[1].value
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
        <Button
          disabled={!isPlayerMove}
          onClick={() => handleDouble(player.id)}
        >
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
