import { SetStateAction } from "jotai";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
export type Shape = Rect | Circle;

type Identity = {
  shapeId: string;
};
type Style = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
};
type Rect = Identity & {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
} & Style;

type Circle = Identity & {
  type: "circle";
  x: number;
  y: number;
  r: number;
} & Style;

export const shapesAtom = atom<Shape[]>([
  {
    shapeId: "1",
    type: "rect",
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    fill: "lightblue",
    stroke: "black",
    strokeWidth: 1,
  },
  {
    shapeId: "2",
    type: "circle",
    x: 200,
    y: 500,
    r: 100,
    fill: "lightgreen",
    stroke: "black",
    strokeWidth: 1,
  },
]);

export const shapeAtomFamily = atomFamily((shapeId: string) =>
  atom(
    (get) => {
      const shapes = get(shapesAtom);
      return shapes.find((shape) => shape.shapeId === shapeId);
    },
    (_get, set, shape: SetStateAction<Shape>) => {
      set(shapesAtom, (prev) => {
        return prev.map((s) => {
          if (s.shapeId === shapeId) {
            const newShape = typeof shape === "function" ? shape(s) : shape;
            return newShape;
          }
          return s;
        });
      });
    }
  )
);

export function useShapes() {
  return useAtomValue(shapesAtom);
}

export function isCrossRect(
  shape: Shape,
  rect: { x: number; y: number; width: number; height: number }
) {
  if (shape.type === "rect") {
    return (
      shape.x <= rect.x + rect.width &&
      shape.y <= rect.y + rect.height &&
      shape.x + shape.width >= rect.x &&
      shape.y + shape.height >= rect.y
    );
  }
  if (shape.type === "circle") {
    return (
      shape.x <= rect.x + rect.width &&
      shape.y <= rect.y + rect.height &&
      shape.x + shape.r >= rect.x &&
      shape.y + shape.r >= rect.y
    );
  }
}
