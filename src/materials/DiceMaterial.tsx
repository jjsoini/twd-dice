import { DiceStyle } from "../types/DiceStyle";
import { TWD1Material } from "./twd1/TWD1Material";
import { TWD2Material } from "./twd2/TWD2Material";
import { TWD3Material } from "./twd3/TWD3Material";

export function DiceMaterial({ diceStyle }: { diceStyle: DiceStyle }) {
  switch (diceStyle) {
    case "TWD1":
      return <TWD1Material />;
    case "TWD2":
      return <TWD2Material />;
    case "TWD3":
      return <TWD3Material />;
    default:
      throw Error(`Dice style ${diceStyle} error: not implemented`);
  }
}
