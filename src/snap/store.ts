import { atom } from "jotai";
import { Shape } from "../shape/type";
import { shapeAtomFamily, shapesAtom } from "../shape/store";
import { atomFamily } from "jotai/utils";
import { selectingIdsAtom } from "../select/store";
import { sendCommandAtom } from "../command";
import { getSnapPoints } from "../shape/getSnapPoints";
const notSelectedShapeIdsAtom = atom((get) => {
  const shapes = get(shapesAtom);
  const selectedShapeIds = get(selectingIdsAtom);
  return shapes
    .map((shape) => shape.shapeId)
    .filter((shapeId) => !selectedShapeIds.includes(shapeId));
});

export type SnapHandle = { id: string; type: "x" | "y"; v: number };
export const snapXsAtom = atom<SnapHandle[]>((get) => {
  const notSelectedShapeIds = get(notSelectedShapeIdsAtom);
  return notSelectedShapeIds.map((shapeId) => get(snapXsAtomFamily(shapeId)));
});

export const snapXsAtomFamily = atomFamily((snapHandleId: string) =>
  atom(
    (get) => {
      const shape = get(shapeAtomFamily(snapHandleId));
      if (!shape) return { id: snapHandleId, type: "x", v: 0 } as const;

      const snapPoints = getSnapPoints(shape.shapeId);
      const snapPoint = snapPoints.find(
        (snapPoint) => snapPoint.name === "center"
      );
      if (!snapPoint) return { id: snapHandleId, type: "x", v: 0 } as const;
      return { id: snapHandleId, type: "x", v: snapPoint.x } as const;
    },
    (get, set, v: number) => {
      const snapHandle = get(snapXsAtomFamily(snapHandleId));
      set(sendCommandAtom, {
        type: "moveShapesByHandle",
        snapHandle,
        v: v,
      });
    }
  )
);
export const snappedShapesXsAtomFamily = atomFamily((snapHandleId: string) =>
  atom((get) => {
    const snapHandle = get(snapXsAtomFamily(snapHandleId));
    const shapes = get(shapesAtom);
    return shapes.filter((shape) => isOnSnapHandle(snapHandle, shape));
  })
);

export const snapYsAtom = atom<SnapHandle[]>((get) => {
  const notSelectedShapeIds = get(notSelectedShapeIdsAtom);
  return notSelectedShapeIds.map((shapeId) => get(snapYsAtomFamily(shapeId)));
});

export const snapYsAtomFamily = atomFamily((snapHandleId: string) =>
  atom(
    (get) => {
      const shape = get(shapeAtomFamily(snapHandleId));
      if (!shape) return { id: snapHandleId, type: "y", v: 0 } as const;
      return { id: snapHandleId, type: "y", v: shape.y } as const;
    },
    (get, set, v: number) => {
      const snapHandle = get(snapYsAtomFamily(snapHandleId));
      set(sendCommandAtom, {
        type: "moveShapesByHandle",
        snapHandle,
        v: v,
      });
    }
  )
);

export const snappedShapesYsAtomFamily = atomFamily((snapHandleId: string) =>
  atom((get) => {
    const snapHandle = get(snapYsAtomFamily(snapHandleId));
    const shapes = get(shapesAtom);
    return shapes.filter((shape) => isOnSnapHandle(snapHandle, shape));
  })
);

export function isOnSnapHandle(snapHandle: SnapHandle, shape: Shape) {
  return findSnapPointOnHandle(snapHandle, shape) !== undefined;
}

export function findSnapPointOnHandle(snapHandle: SnapHandle, shape: Shape) {
  const snapPoints = getSnapPoints(shape.shapeId);
  return snapPoints.find((snapPoint) => {
    switch (snapHandle.type) {
      case "x":
        return snapPoint.x === snapHandle.v;
      case "y":
        return snapPoint.y === snapHandle.v;
    }
  });
}
