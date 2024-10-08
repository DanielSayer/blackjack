import { toast } from "sonner";

type ResultToastProps = {
  message?: string;
  winnings: number;
};

export const resultToast = (
  props: ResultToastProps & { numberOfPlayers: number }
) => {
  if (props.numberOfPlayers !== 1) {
    return;
  }

  return toast.info(
    <div>
      <p className="font-bold text-xl">{props.message}</p>
      <p>You win ${props.winnings}</p>
    </div>
  );
};

export const successToast = (props: ResultToastProps) => {
  return toast.success(
    <div>
      <p className="font-bold text-xl">{props.message}</p>
      <p>
        ${props.winnings} will be added to your balance at the end of the game
      </p>
    </div>
  );
};

export const massToast = (props: ResultToastProps & { details: string[] }) => {
  return toast.info(
    <div>
      <p className="font-bold text-xl">You win ${props.winnings}</p>
      <ul>
        {props.details.map((detail, index) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>
    </div>
  );
};
