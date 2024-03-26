import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { WritableDraft } from "immer/dist/types/types-external";

import { DiceRoll } from "../types/DiceRoll";
import { isDie } from "../types/Die";
import { isDice } from "../types/Dice";
import { getDieFromDice } from "../helpers/getDieFromDice";
import { DiceTransform } from "../types/DiceTransform";
import { getRandomDiceThrow } from "../helpers/DiceThrower";
import { generateDiceId } from "../helpers/generateDiceId";
import { DiceThrow } from "../types/DiceThrow";

interface DiceRollState {
  roll: DiceRoll | null;
  /**
   * A mapping from the die ID to its roll result.
   * A value of `null` means the die hasn't finished rolling yet.
   */
  rollValues: Record<string, number | null>;
  /**
   * A mapping from the die ID to its final roll transform.
   * A value of `null` means the die hasn't finished rolling yet.
   */
  rollTransforms: Record<string, DiceTransform | null>;
  /**
   * A mapping from the die ID to its initial roll throw state.
   */
  rollThrows: Record<string, DiceThrow>;
  startRoll: (roll: DiceRoll, speedMultiplier?: number) => void;
  clearRoll: (ids?: string) => void;
  reroll: (ids?: string[], manualThrows?: Record<string, DiceThrow>) => void;
  push: (ids?: string[], manualThrows?: Record<string, DiceThrow>) => void;
  addDie: () => void;
  finishDieRoll: (id: string, number: number, transform: DiceTransform) => void;
  addStress: () => void;
}

export const useDiceRollStore = create<DiceRollState>()(
  immer((set) => ({
    roll: null,
    rollValues: {},
    rollTransforms: {},
    rollThrows: {},
    startRoll: (roll, speedMultiplier?: number) =>
      set((state) => {
        state.roll = roll;
        state.rollValues = {};
        state.rollTransforms = {};
        state.rollThrows = {};
        // Set all values to null
        const dice = getDieFromDice(roll);
        for (const die of dice) {
          state.rollValues[die.id] = null;
          state.rollTransforms[die.id] = null;
          let speed:number = 1;
          if (speedMultiplier) {
            speed = speedMultiplier;
          }
          state.rollThrows[die.id] = getRandomDiceThrow(Math.max(1.7,speed));
        }
      }),
    clearRoll: (ids) =>
      set((state) => {
        
        if(ids){
          if(true){
            //deleting dice.. create new draft that copies all the dice rolls and transforms except the one with the id.
            let newRoll: WritableDraft<DiceRoll> = {dice:[], hidden: state.roll?.hidden};
            let newValues: WritableDraft<Record<string, number | null>> = {};
            let newTransforms: WritableDraft<Record<string, DiceTransform | null>> = {};
            let newThrows: WritableDraft<Record<string, DiceThrow>> = {};
            if (state.roll !== null) {
              for(const die of state.roll.dice){
                if(isDie(die)){
                  if(die.id !== ids){
                    newRoll.dice.push(die);
                    newValues[die.id] = state.rollValues[die.id];
                    newTransforms[die.id] = state.rollTransforms[die.id];
                    newThrows[die.id] = state.rollThrows[die.id];
                  }
                }
              }
            }
            state.roll = null;
            state.rollValues = {};
            state.rollTransforms = {};
            state.rollThrows = {};
            state.roll = newRoll;
            state.rollValues = newValues;
            state.rollTransforms = newTransforms;
            state.rollThrows = newThrows;
          }
        } else {
          state.roll = null;
          state.rollValues = {};
          state.rollTransforms = {};
          state.rollThrows = {};     
        }
      }),
    reroll: (ids, manualThrows) => {
      set((state) => {
        if (state.roll) {
          rerollDraft(
            state.roll,
            ids,
            manualThrows,
            state.rollValues,
            state.rollTransforms,
            state.rollThrows
          );
        }
      });
    },
    push: (ids, manualThrows) => {
      set((state) => {
        if (state.roll) {
          pushDraft(
            state.roll,
            ids,
            manualThrows,
            state.rollValues,
            state.rollTransforms,
            state.rollThrows
          );
        }
      });
    },
    addDie: () => {
      set((state) => {
        if (state.roll) {
          addDieDraft(
            state.roll,
            state.rollValues,
            state.rollTransforms,
            state.rollThrows
          );
        }
      });
    },
    finishDieRoll: (id, number, transform) => {
      set((state) => {
        state.rollValues[id] = number;
        state.rollTransforms[id] = transform;
      });
    },
    addStress: () => {
      set((state) => {
        if (state.roll) {
          addStressDraft(
            state.roll,
            state.rollValues,
            state.rollTransforms,
            state.rollThrows
          );
        }
      });
    },
  }))
);

/** Recursively update the ids of a draft to reroll dice */
function rerollDraft(
  diceRoll: WritableDraft<DiceRoll>,
  ids: string[] | undefined,
  manualThrows: Record<string, DiceThrow> | undefined,
  rollValues: WritableDraft<Record<string, number | null>>,
  rollTransforms: WritableDraft<Record<string, DiceTransform | null>>,
  rollThrows: WritableDraft<Record<string, DiceThrow>>
) {

  for (let dieOrDice of diceRoll.dice) {
    if (isDie(dieOrDice)) {
      if (!ids || ids.includes(dieOrDice.id)) {
        delete rollValues[dieOrDice.id];
        delete rollTransforms[dieOrDice.id];
        delete rollThrows[dieOrDice.id];
        const manualThrow = manualThrows?.[dieOrDice.id];
        const id = generateDiceId();
        dieOrDice.id = id;
        rollValues[id] = null;
        rollTransforms[id] = null;
        if (manualThrow) {
          rollThrows[id] = manualThrow;
        } else {
          rollThrows[id] = getRandomDiceThrow(1.7);
        }
      }
    } else if (isDice(dieOrDice)) {
      rerollDraft(
        dieOrDice,
        ids,
        manualThrows,
        rollValues,
        rollTransforms,
        rollThrows
      );
    }
  }
}

/** Recursively update the ids of a draft to reroll dice */
function pushDraft(
  diceRoll: WritableDraft<DiceRoll>,
  ids: string[] | undefined,
  manualThrows: Record<string, DiceThrow> | undefined,
  rollValues: WritableDraft<Record<string, number | null>>,
  rollTransforms: WritableDraft<Record<string, DiceTransform | null>>,
  rollThrows: WritableDraft<Record<string, DiceThrow>>
) {

    const newId = generateDiceId();
    diceRoll.dice.push({id:newId, style:"TWD2", type:"D6"});
    rollValues[newId] = null;
    rollTransforms[newId] = null;
    rollThrows[newId] = getRandomDiceThrow(2);

  for (let dieOrDice of diceRoll.dice) {
    if (isDie(dieOrDice)) {
      if (!ids || ids.includes(dieOrDice.id)) {
        delete rollValues[dieOrDice.id];
        delete rollTransforms[dieOrDice.id];
        delete rollThrows[dieOrDice.id];
        const manualThrow = manualThrows?.[dieOrDice.id];
        const id = generateDiceId();
        dieOrDice.id = id;
        rollValues[id] = null;
        rollTransforms[id] = null;
        if (manualThrow) {
          rollThrows[id] = manualThrow;
        } else {
          rollThrows[id] = getRandomDiceThrow();
        }
      }
    } else if (isDice(dieOrDice)) {
      pushDraft(
        dieOrDice,
        ids,
        manualThrows,
        rollValues,
        rollTransforms,
        rollThrows
      );
    }
  }
}

function addDieDraft(
  diceRoll: WritableDraft<DiceRoll>,
  rollValues: WritableDraft<Record<string, number | null>>,
  rollTransforms: WritableDraft<Record<string, DiceTransform | null>>,
  rollThrows: WritableDraft<Record<string, DiceThrow>>,
  isStress?:boolean
) {

    const newId = generateDiceId();
    diceRoll.dice.push({id:newId, style:"TWD1", type:"D6"});
    rollValues[newId] = null;
    rollTransforms[newId] = null;
    rollThrows[newId] = getRandomDiceThrow(2);

}

function addStressDraft(
  diceRoll: WritableDraft<DiceRoll>,
  rollValues: WritableDraft<Record<string, number | null>>,
  rollTransforms: WritableDraft<Record<string, DiceTransform | null>>,
  rollThrows: WritableDraft<Record<string, DiceThrow>>,
  isStress?:boolean
) {

    const newId = generateDiceId();
    diceRoll.dice.push({id:newId, style:"TWD2", type:"D6"});
    rollValues[newId] = null;
    rollTransforms[newId] = null;
    rollThrows[newId] = getRandomDiceThrow(2);

}