import { atom } from "jotai";
import { Shape } from "./shape/type";
import { baseShapesAtom } from "./shape/shapeStore";
import { findSnapPointOnHandle, SnapHandle } from "./snap/snapStore";

type Command =
  | MoveShapeCommand
  | AddShapeCommand
  | DeleteShapeCommand
  | MoveShapesByHandleCommand;

export const sendCommandAtom = atom(null, (_get, set, command: Command) => {
  // console.log("sendCommand", command);

  set(baseShapesAtom, (prev) => {
    switch (command.type) {
      case "moveShape": {
        return moveShape(prev, command);
      }
      case "addShape": {
        return addShape(prev, command);
      }
      case "deleteShape": {
        return deleteShape(prev, command);
      }
      case "moveShapesByHandle": {
        return moveShapesByHandle(prev, command);
      }
    }
  });
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

type AddShapeCommand = {
  type: "addShape";
  shapes: Shape[];
};
function addShape(prev: Shape[], command: AddShapeCommand): Shape[] {
  const newShapes = command.shapes.map((shape) => ({
    ...shape,
    shapeId: randomId(),
  }));
  return [...prev, ...newShapes];
}
const randomId = () => Math.random().toString(36).substring(2, 15);

type DeleteShapeCommand = {
  type: "deleteShape";
  shapeIds: string[];
};
function deleteShape(prev: Shape[], command: DeleteShapeCommand): Shape[] {
  return prev.filter((shape) => !command.shapeIds.includes(shape.shapeId));
}

type MoveShapesByHandleCommand = {
  type: "moveShapesByHandle";
  snapHandle: SnapHandle;
  v: number;
};
function moveShapesByHandle(
  prev: Shape[],
  command: MoveShapesByHandleCommand
): Shape[] {
  return prev.map((shape) => {
    const foundSnapPoint = findSnapPointOnHandle(command.snapHandle, shape);
    if (foundSnapPoint) {
      switch (command.snapHandle.type) {
        case "x":
          return { ...shape, x: command.v - foundSnapPoint.offsetX };
        case "y":
          return { ...shape, y: command.v - foundSnapPoint.offsetY };
      }
    }
    return shape;
  });
}
