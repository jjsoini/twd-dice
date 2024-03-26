import { Dice, isDice } from "../types/Dice";
import { isDie } from "../types/Die";

/**
 * Get dice that can be pushed
 * @param dice
 * @param values A mapping of Die ID to their rolled value
 * @returns
 */
export function getDieToDelete(
    dice: Dice,
    values: Record<string, number>,
    isStress?: boolean
  ): string | undefined {

    let dice_arr: string[] = [];
    let style = "TWD1";
    if (isStress) {
        style = "TWD2";
    }

    for (const dieOrDice of dice.dice) {
      if (isDie(dieOrDice)) {
        const value = values[dieOrDice.id];
        if (value !== undefined) {
            if (dieOrDice.style === style && dieOrDice.type === "D6") {
              dice_arr.push(dieOrDice.id);
            }
        }
      }
    }

    dice_arr.sort(compareDice);
    return dice_arr.shift();

    function compareDice(a: string,b: string) {
        let aval = values[a];
        let bval = values[b];
        if(isStress) {
            if(aval==1) { aval=7;}
            if(bval==1) { bval=7;}
        }
        if (aval < bval) {
            return -1;
        } else if (aval > bval) {
            return 1;
        }
        return 0;
    }

  }