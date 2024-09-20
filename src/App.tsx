import { ArrowRight } from "lucide-react";
import { Game } from "./components/game";
import { Button } from "./components/ui/button";
import { useBlackjackStore } from "./stores/useBlackjackStore";

function App() {
  const { gameState, handleStartGame } = useBlackjackStore((set) => set);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      {gameState === "not-started" ? (
        <>
          <h1 className="text-6xl">Blackjack</h1>
          <Button onClick={handleStartGame}>
            Start Game <ArrowRight className="w-4 h-4 ms-2" />
          </Button>
        </>
      ) : (
        <Game />
      )}
    </div>
  );
}

export default App;
