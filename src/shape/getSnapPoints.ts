import { getDefaultStore } from "jotai";
import { shapeAtomFamily } from "./shapeStore";
const store = getDefaultStore();
export function getSnapPoints(shapeId: string) {
  const shape = store.get(shapeAtomFamily(shapeId));
  if (!shape) return [];
  switch (shape.type) {
    case "rect": {
      return [
        {
          name: "center",
          x: shape.x + shape.width / 2,
          y: shape.y + shape.height / 2,
          offsetX: shape.width / 2,
          offsetY: shape.height / 2,
        },
      ];
    }
    case "circle": {
      return [
        {
          name: "center",
          x: shape.x,
          y: shape.y,
          offsetX: 0,
          offsetY: 0,
        },
      ];
    }
  }
}
