import { atom, useAtomValue, getDefaultStore } from "jotai";
import { screenToSvg } from "./screenToSvg";
import { subscribeSvgEvent } from "./Svg";
import { isCrossRect } from "./shape/isCrossRect";
import { shapesAtom } from "./shape/store";
import { selectingIdsAtom } from "./select/store";

const dragEventAtom = atom(
  null,
  (_get, _set, e: React.PointerEvent<SVGSVGElement>) => {
    let fn = currentState;
    while (fn) {
      const next = fn(e);
      if (next && "continue" in next) {
        fn = next.continue;
        continue;
      }
      if (next) currentState = next;
      break;
    }
  }
);
subscribeSvgEvent(dragEventAtom);
type StateFn = (e: React.PointerEvent<SVGSVGElement>) =>
  | void // 停止
  | StateFn // 遷移
  | { continue: StateFn }; // 移譲;

const initialState: StateFn = (e) => {
  switch (e.type) {
    case "pointerdown":
      if (e.target instanceof SVGElement && e.target.tagName !== "svg") {
        return;
      }
      return pointerIsDown;
  }
};
let currentState: StateFn = initialState;

const store = getDefaultStore();

const startPointAtom = atom<{ x: number; y: number } | null>(null);
const endPointAtom = atom<{ x: number; y: number } | null>(null);

type Rect = { x: number; y: number; width: number; height: number };
const draggingRectAtom = atom<Rect | null>((get) => {
  const start = get(startPointAtom);
  const end = get(endPointAtom);
  if (!start || !end) return null;

  const rect = {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y),
  };

  return rect;
});
const pointerIsDown: StateFn = (e) => {
  const downPoint = screenToSvg(e);
  store.set(startPointAtom, downPoint);
  switch (e.type) {
    case "pointermove":
      return pointerIsMoving;
    case "pointerup":
      return pointerIsUp;
  }
};

const pointerIsMoving: StateFn = (e) => {
  const point = screenToSvg(e);
  store.set(endPointAtom, point);

  switch (e.type) {
    case "pointermove":
      return pointerIsMoving;
    case "pointerup":
      return { continue: pointerIsUp };
  }
};

const pointerIsUp: StateFn = () => {
  const draggingRect = store.get(draggingRectAtom);
  if (!draggingRect) return initialState;

  // 交差している図形を選択
  const shapes = store.get(shapesAtom);
  const shapeIds = shapes
    .filter((shape) => isCrossRect(shape, draggingRect))
    .map((shape) => shape.shapeId);
  if (shapeIds.length > 0) {
    store.set(selectingIdsAtom, shapeIds);
  }

  store.set(startPointAtom, null);
  store.set(endPointAtom, null);
  return initialState;
};

export function DraggingRect() {
  const draggingRect = useAtomValue(draggingRectAtom);
  if (!draggingRect) return null;
  return (
    <rect
      x={draggingRect.x}
      y={draggingRect.y}
      width={draggingRect.width}
      height={draggingRect.height}
      fill="none"
      stroke="black"
      strokeWidth={1}
      strokeDasharray="4 4"
    />
  );
}
