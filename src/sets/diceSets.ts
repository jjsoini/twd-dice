import { DiceSet } from "../types/DiceSet";
import { DiceStyle } from "../types/DiceStyle";
import { Die } from "../types/Die";

import * as twd1Previews from "../previews/twd1";
import * as twd2Previews from "../previews/twd2";
import * as twd3Previews from "../previews/twd3";

import allPreview from "../previews/all.png";

const standardPreviews: Record<DiceStyle, string> = {
  TWD1: twd1Previews.D6,
  TWD2: twd2Previews.D100,
  TWD3: twd3Previews.D20,
};

function createStandardSet(style: DiceStyle): DiceSet {
  const id = `${style}_STANDARD`;
  return {
    id,
    name: `${style.toLowerCase()} dice`,
    dice: [
      { id: `${id}_D6`, type: "D6", style},
      { id: `${id}_D6ammo`, type: "D6", style: "TWD2" },
      /*{ id: `${id}_D6location`, type: "D6", style: "TWD3" },*/
    ],
    previewImage: standardPreviews[style],
  };
}

function createSecondarySet(style: DiceStyle): DiceSet {
  const id = `${style}_STANDARD`;
  return {
    id,
    name: `${style.toLowerCase()} dice`,
    dice: [
      { id: `${id}_D4`, type: "D4", style: "TWD1" },
      { id: `${id}_D20`, type: "D20", style: "TWD1" },
      { id: `${id}_D100`, type: "D100", style },
    ],
    previewImage: standardPreviews[style],
  };
}

const standardSets = [
  createStandardSet("TWD1"), createSecondarySet("TWD2"),
];

const allSet: DiceSet = {
  id: "all",
  name: "all",
  dice: standardSets.reduce(
    (prev, curr) => [...prev, ...curr.dice],
    [] as Die[]
  ),
  previewImage: allPreview,
};

export const diceSets: DiceSet[] = [...standardSets, allSet];
