import { atom } from "jotai";
import { Shape } from "./shape/type";
import { shapesAtom } from "./shape/store";

type Command = MoveShapeCommand;

export const sendCommandAtom = atom(null, (_get, set, command: Command) => {
  console.log("sendCommand", command);

  switch (command.type) {
    case "moveShape":
      set(shapesAtom, (prev) => moveShape(prev, command));
  }
});

type MoveShapeCommand = {
  type: "moveShape";
  shapeId: string;
  position: { x: number; y: number };
};
function moveShape(prev: Shape[], command: MoveShapeCommand): Shape[] {
  return prev.map((shape) => {
    if (shape.shapeId === command.shapeId) {
      return { ...shape, x: command.position.x, y: command.position.y };
    }
    return shape;
  });
}
