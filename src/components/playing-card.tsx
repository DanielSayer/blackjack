import { getFileName, type Card } from "@/lib/cards";
import { useMemo } from "react";

type CardProps = {
  card: Card;
};

export function PlayingCard({ card }: CardProps) {
  const title = card.isHidden ? "hidden" : card.rank;
  const fileName = useMemo(() => {
    if (card.isHidden) {
      return "./BACK.png";
    }
    return `./${getFileName(card)}.png`;
  }, [card]);

  return <img src={fileName} alt={title} width={200} height={300} />;
}
