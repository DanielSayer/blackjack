import { useEffect } from "react";
import { Game } from "./components/game";
import { Button } from "./components/ui/button";
import { useGameStore } from "./stores/useGameStore";

function App() {
  const { isGameStarted, startGame, isGameOver } = useGameStore();

  useEffect(() => {
    if (isGameOver) {
      setTimeout(() => {
        alert("Game Over");
      }, 500);
    }
  }, [isGameOver]);

  return (
    <div>
      <h1>Blackjack</h1>

      {isGameStarted ? (
        <Game />
      ) : (
        <Button onClick={startGame}>Start Game</Button>
      )}
    </div>
  );
}

export default App;
