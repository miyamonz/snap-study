import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
import { Shape } from "./type";

export const baseShapesAtom = atom<Shape[]>([
  {
    shapeId: "1",
    type: "rect",
    x: 283,
    y: 119,
    width: 100,
    height: 100,
    fill: "lightblue",
    stroke: "black",
    strokeWidth: 1,
  },
  {
    shapeId: "2",
    type: "circle",
    x: 510,
    y: 463,
    r: 100,
    fill: "lightgreen",
    stroke: "black",
    strokeWidth: 1,
  },
  {
    shapeId: "0rbsbddm93a",
    type: "circle",
    x: 822,
    y: 463,
    r: 100,
    fill: "lightgreen",
    stroke: "black",
    strokeWidth: 1,
  },
]);
export const shapesAtom = atom((get) => get(baseShapesAtom));

export const shapeAtomFamily = atomFamily((shapeId: string) =>
  atom((get) => {
    const shapes = get(shapesAtom);
    return shapes.find((shape) => shape.shapeId === shapeId);
  })
);

export function useShapes() {
  return useAtomValue(shapesAtom);
}
