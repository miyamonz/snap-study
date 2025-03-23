import { getDefaultStore } from "jotai";
import { snapXsAtom, snapYsAtom } from "./snapStore";
import { shapeAtomFamily } from "../shape/shapeStore";
import { getSnapPoints } from "../shape/getSnapPoints";
export function fixToSnap(shapeId: string, position: { x: number; y: number }) {
  const store = getDefaultStore();
  const shape = store.get(shapeAtomFamily(shapeId));
  if (!shape) return position;
  const snapPoints = getSnapPoints(shapeId);
  const snapPoint = snapPoints.find((snapPoint) => snapPoint.name === "center");
  if (!snapPoint) return position;

  const snapXs = store.get(snapXsAtom);
  const snapYs = store.get(snapYsAtom);
  const threshold = 30;

  const sp = {
    x: position.x + snapPoint.offsetX,
    y: position.y + snapPoint.offsetY,
  };

  const foundSnapPointX = snapXs.find((x) => {
    const distance = Math.abs(x.v - sp.x);
    return distance < threshold;
  });
  if (foundSnapPointX) {
    const diff = foundSnapPointX.v - sp.x;
    const diffAbs = Math.abs(diff);
    if (diffAbs < threshold) {
      position.x = position.x + diff;
    }
  }

  const foundSnapPointY = snapYs.find((y) => {
    const distance = Math.abs(y.v - sp.y);
    return distance < threshold;
  });
  if (foundSnapPointY) {
    const diff = foundSnapPointY.v - sp.y;
    const diffAbs = Math.abs(diff);
    if (diffAbs < threshold) {
      position.y = position.y + diff;
    }
  }

  return position;
}
// function snap(a: number, b: number, threshold: number) {
//   //一般的なsnap
//   const diff = a - b;
//   if (Math.abs(diff) < threshold) return b;
//   return a;

//   // 連続的にsnap
//   const t = 1 - Math.abs(diff / threshold) ** 10;
//   return (1 - t) * a + t * b;
// }
