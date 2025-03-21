import { getDefaultStore } from "jotai";
import { snapXsAtom, snapYsAtom } from "./store";
export function getSnapPoint(
  _shapeId: string,
  position: { x: number; y: number }
) {
  const store = getDefaultStore();
  const snapXs = store.get(snapXsAtom);
  const snapYs = store.get(snapYsAtom);
  const threshold = 30;

  const foundSnapPointX = snapXs.find((x) => {
    const distance = Math.abs(x.v - position.x);
    return distance < threshold;
  });
  if (foundSnapPointX) {
    position.x = snap(position.x, foundSnapPointX.v, threshold);
  }

  const foundSnapPointY = snapYs.find((y) => {
    const distance = Math.abs(y.v - position.y);
    return distance < threshold;
  });
  if (foundSnapPointY) {
    position.y = snap(position.y, foundSnapPointY.v, threshold);
  }

  return position;
}
function snap(a: number, b: number, threshold: number) {
  //一般的なsnap
  const diff = a - b;
  if (Math.abs(diff) < threshold) return b;
  return a;

  // 連続的にsnap
  const t = 1 - Math.abs(diff / threshold) ** 10;
  return (1 - t) * a + t * b;
}
