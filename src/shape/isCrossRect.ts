import type { Shape } from "./type";

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
