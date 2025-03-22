import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
import { Shape } from "./type";

export const baseShapesAtom = atom<Shape[]>([
  {
    shapeId: "1",
    type: "rect",
    x: 161,
    y: 42,
    width: 100,
    height: 100,
    fill: "lightgray",
    stroke: "black",
    strokeWidth: 1,
  },
  {
    shapeId: "2",
    type: "circle",
    x: 539,
    y: 92,
    r: 60,
    fill: "salmon",
    stroke: "black",
    strokeWidth: 1,
  },
  {
    shapeId: "0rbsbddm93a",
    type: "circle",
    x: 982,
    y: 549,
    r: 80,
    fill: "lightblue",
    stroke: "black",
    strokeWidth: 1,
  },
  {
    shapeId: "e53qxitxwad",
    type: "circle",
    x: 603,
    y: 410,
    r: 110,
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
