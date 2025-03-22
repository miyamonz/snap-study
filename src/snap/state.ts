import { getDefaultStore } from "jotai";
import { screenToSvg } from "../screenToSvg";
import { getSnapHandle } from "./SnapLines";
import { snapXsAtomFamily, snapYsAtomFamily } from "./store";
import { subscribeSvgEvent } from "../Svg";

type StateFn = (e: React.PointerEvent<SVGSVGElement>) =>
  | void // 停止
  | StateFn // 遷移
  | { continue: StateFn }; // 移譲
let currentState: StateFn = initialState;
function onPointerEvent(e: React.PointerEvent<SVGSVGElement>) {
  if (!(e.target instanceof SVGElement)) return;
  const snapHandle = getSnapHandle(e.target);
  if (!snapHandle) return;

  let fn = currentState;
  while (fn) {
    const next = fn(e);
    // console.log(fn.name, next);
    if (next && "continue" in next) {
      fn = next.continue;
      continue;
    }
    if (next) currentState = next;
    break;
  }
}
export function registerSnapEvent() {
  subscribeSvgEvent(onPointerEvent);
}
const store = getDefaultStore();
export function initialState(e: React.PointerEvent<SVGSVGElement>) {
  if (e.type === "pointerdown") {
    return { continue: onPointerDown };
  }
}
let downPoint: { x: number; y: number } | null = null;
let startValue: number | null = null;
const onPointerDown: StateFn = (e) => {
  if (!(e.target instanceof SVGElement)) return;
  const eventTarget = e.target;
  const snapHandle = getSnapHandle(eventTarget);
  if (!snapHandle) return;

  downPoint = screenToSvg(e);
  startValue = snapHandle.v;

  e.target.setPointerCapture(e.pointerId);
  return pointerIsDown;
};
const pointerIsDown: StateFn = (e) => {
  switch (e.type) {
    case "pointerup":
      return initialState;
    case "pointermove":
      return pointerIsMoving;
  }
};
const pointerIsMoving: StateFn = (e) => {
  if (!(e.target instanceof SVGElement)) return;
  if (!downPoint) return;
  const currentPoint = screenToSvg(e);
  const diff = {
    x: currentPoint.x - downPoint.x,
    y: currentPoint.y - downPoint.y,
  };

  const snapHandle = getSnapHandle(e.target);
  if (!snapHandle) return;
  if (!startValue) return;

  switch (snapHandle.type) {
    case "x": {
      store.set(snapXsAtomFamily(snapHandle.id), startValue + diff.x);
      break;
    }
    case "y": {
      store.set(snapYsAtomFamily(snapHandle.id), startValue + diff.y);
      break;
    }
  }

  switch (e.type) {
    case "pointerup": {
      downPoint = null;
      startValue = null;
      return initialState;
    }
  }
};
