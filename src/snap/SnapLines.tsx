import { useAtomValue, atom, getDefaultStore } from "jotai";
import { screenToSvg } from "../screenToSvg";
import {
  snapXsAtom,
  snapYsAtom,
  type SnapHandle,
  snappedShapesXsAtomFamily,
  snappedShapesYsAtomFamily,
  snapXsAtomFamily,
  snapYsAtomFamily,
} from "./store";
import { useViewBox, subscribeSvgEvent } from "../Svg";

export function SnapLines() {
  return (
    <>
      <SnapLinesX />
      <SnapLinesY />
    </>
  );
}
function SnapLinesX() {
  const snapXs = useAtomValue(snapXsAtom);
  return (
    <>
      {snapXs.map((x) => (
        <SnapHandleX key={`x:${x.id}`} snapHandle={x} />
      ))}
    </>
  );
}
function SnapLinesY() {
  const snapYs = useAtomValue(snapYsAtom);
  return (
    <>
      {snapYs.map((y) => (
        <SnapHandleY key={`y:${y.id}`} snapHandle={y} />
      ))}
    </>
  );
}

function SnapHandleX({ snapHandle }: { snapHandle: SnapHandle }) {
  const { scale } = useViewBox();
  const snappedShapes = useAtomValue(snappedShapesXsAtomFamily(snapHandle.id));
  if (snappedShapes.length <= 1) return null;
  return (
    <>
      <LineX
        data-snap-handle={JSON.stringify(snapHandle)}
        v={snapHandle.v}
        className={`stroke-transparent hover:stroke-green-400 ${
          snappedShapes.length > 1 ? "stroke-green-400" : ""
        }`}
        strokeWidth={15 * scale}
      />
      <LineX v={snapHandle.v} strokeDasharray="2 2" />
    </>
  );
}
function LineX({ v, ...rest }: { v: number } & React.SVGProps<SVGLineElement>) {
  const { rect, scale } = useViewBox();
  const strokeWidth = 1 * scale;
  return (
    <line
      x1={v}
      y1={rect.y}
      x2={v}
      y2={rect.y + rect.height}
      stroke="green"
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}
function SnapHandleY({ snapHandle }: { snapHandle: SnapHandle }) {
  const { scale } = useViewBox();
  const snappedShapes = useAtomValue(snappedShapesYsAtomFamily(snapHandle.id));
  if (snappedShapes.length <= 1) return null;
  return (
    <>
      <LineY
        data-snap-handle={JSON.stringify(snapHandle)}
        v={snapHandle.v}
        className={`stroke-transparent hover:stroke-green-400`}
        strokeWidth={15 * scale}
      />
      <LineY v={snapHandle.v} strokeDasharray="2 2" />
    </>
  );
}
function LineY({ v, ...rest }: { v: number } & React.SVGProps<SVGLineElement>) {
  const { rect, scale } = useViewBox();
  const strokeWidth = 1 * scale;
  return (
    <line
      x1={rect.x}
      y1={v}
      x2={rect.x + rect.width}
      y2={v}
      stroke="green"
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}

let currentState: StateFn = initialState;
const onKeyEventAtom = atom(
  null,
  (_get, _set, e: React.PointerEvent<SVGSVGElement>) => {
    onPointerEvent(e);
  }
);
function onPointerEvent(e: React.PointerEvent<SVGSVGElement>) {
  if (!(e.target instanceof SVGElement)) return;
  const snapHandle = getSnapHandle(e.target);
  if (!snapHandle) return;

  let fn = currentState;
  while (fn) {
    const next = fn(e);
    console.log(fn.name, next);
    if (next && "continue" in next) {
      fn = next.continue;
      continue;
    }
    if (next) currentState = next;
    break;
  }
}
export function registerSnapEvent() {
  subscribeSvgEvent(onKeyEventAtom);
}

function getSnapHandle(target: SVGElement) {
  const snapHandle = target.dataset.snapHandle;
  if (!snapHandle) return null;
  try {
    return JSON.parse(snapHandle) as SnapHandle;
  } catch {
    return null;
  }
}
type StateFn = (e: React.PointerEvent<SVGSVGElement>) =>
  | void // 停止
  | StateFn // 遷移
  | { continue: StateFn }; // 移譲

const store = getDefaultStore();
function initialState(e: React.PointerEvent<SVGSVGElement>) {
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
