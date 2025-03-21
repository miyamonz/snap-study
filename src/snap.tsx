import { subscribeSvgEvent, useViewBox } from "./Svg";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import { screenToSvg } from "./screenToSvg";
import { Shape, shapeAtomFamily, shapesAtom } from "./state";
import { atomFamily } from "jotai/utils";
import { selectingIdsAtom } from "./selectingEvent";

type SnapHandle = { id: string; type: "x" | "y"; v: number };
export const snapXsAtom = atom<SnapHandle[]>((get) => {
  const shapes = get(shapesAtom);
  const selectedShapeIds = get(selectingIdsAtom);
  return shapes
    .filter((shape) => !selectedShapeIds.includes(shape.shapeId))
    .map((shape) => {
      return {
        id: shape.shapeId,
        type: "x",
        v: shape.x,
      };
    });
});

const snapXsAtomFamily = atomFamily((snapHandleId: string) =>
  atom(
    (get) => {
      const shape = get(shapeAtomFamily(snapHandleId));
      if (!shape) return { id: snapHandleId, type: "x", v: 0 } as const;
      return { id: snapHandleId, type: "x", v: shape.x } as const;
    },
    (get, set, v: number) => {
      const snapHandle = get(snapXsAtomFamily(snapHandleId));
      set(shapesAtom, (prev) => {
        const shapes = prev.map((shape) => {
          if (isOnSnapHandle(snapHandle, shape)) {
            return { ...shape, x: v };
          }
          return shape;
        });
        return shapes;
      });
    }
  )
);
const snappedShapesXsAtomFamily = atomFamily((snapHandleId: string) =>
  atom((get) => {
    const snapHandle = get(snapXsAtomFamily(snapHandleId));
    const shapes = get(shapesAtom);
    return shapes.filter((shape) => isOnSnapHandle(snapHandle, shape));
  })
);

export const snapYsAtom = atom<SnapHandle[]>((get) => {
  const shapes = get(shapesAtom);
  const selectedShapeIds = get(selectingIdsAtom);
  return shapes
    .filter((shape) => !selectedShapeIds.includes(shape.shapeId))
    .map((shape) => {
      return {
        id: shape.shapeId,
        type: "y",
        v: shape.y,
      };
    });
});

const snapYsAtomFamily = atomFamily((snapHandleId: string) =>
  atom(
    (get) => {
      const shape = get(shapeAtomFamily(snapHandleId));
      if (!shape) return { id: snapHandleId, type: "y", v: 0 } as const;
      return { id: snapHandleId, type: "y", v: shape.y } as const;
    },
    (get, set, v: number) => {
      const snapHandle = get(snapYsAtomFamily(snapHandleId));
      set(shapesAtom, (prev) => {
        const shapes = prev.map((shape) => {
          if (isOnSnapHandle(snapHandle, shape)) {
            return { ...shape, y: v };
          }
          return shape;
        });
        return shapes;
      });
    }
  )
);

const snappedShapesYsAtomFamily = atomFamily((snapHandleId: string) =>
  atom((get) => {
    const snapHandle = get(snapYsAtomFamily(snapHandleId));
    const shapes = get(shapesAtom);
    return shapes.filter((shape) => isOnSnapHandle(snapHandle, shape));
  })
);

export function SnapLines() {
  const snapXs = useAtomValue(snapXsAtom);
  const snapYs = useAtomValue(snapYsAtom);
  return (
    <>
      {/* x */}
      {snapXs.map((x) => (
        <SnapHandleX key={`x:${x.id}`} snapHandle={x} />
      ))}

      {/* y */}
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
        strokeWidth={10 * scale}
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
        strokeWidth={10 * scale}
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
);
subscribeSvgEvent(onKeyEventAtom);

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

function isOnSnapHandle(snapHandle: SnapHandle, shape: Shape) {
  if (snapHandle.type === "x") {
    return shape.x === snapHandle.v;
  }
  if (snapHandle.type === "y") {
    return shape.y === snapHandle.v;
  }
  return false;
}
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
  const s = startValue;

  switch (snapHandle.type) {
    case "x": {
      store.set(snapXsAtomFamily(snapHandle.id), s + diff.x);
      break;
    }
    case "y": {
      store.set(snapYsAtomFamily(snapHandle.id), s + diff.y);

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
