import { useBlackjackStore } from "@/stores/useBlackjackStore";
import { AcceptingBetsScreen } from "./accepting-bets-screen";
import { InProgressScreen } from "./in-progress-screen";

export const Game = () => {
  const { playerBalance } = useBlackjackStore();

  return (
    <div>
      <div className="absolute top-10 right-10 text-2xl text-muted-foreground">
        <div className="flex gap-2">
          <p>Balance: </p>
          <p>${playerBalance}</p>
        </div>
      </div>
      <Screens />
    </div>
  );
};

const Screens = () => {
  const { gameState } = useBlackjackStore();
  switch (gameState) {
    case "not-started":
      throw new Error("Game is not started");
    case "accepting-bets":
      return <AcceptingBetsScreen />;
    default:
      return <InProgressScreen />;
  }
};
