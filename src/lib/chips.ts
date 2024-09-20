export const chips = [
  { display: "$5", value: 5, colour: "red" },
  { display: "$10", value: 10, colour: "orange" },
  { display: "$25", value: 25, colour: "yellow" },
  { display: "$50", value: 50, colour: "green" },
  { display: "$100", value: 100, colour: "blue" },
  { display: "$250", value: 250, colour: "indigo" },
  { display: "$500", value: 500, colour: "violet" },
] as const;
export type Chips = (typeof chips)[number];
