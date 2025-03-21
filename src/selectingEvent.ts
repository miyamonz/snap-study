import { atom, getDefaultStore, useAtomValue } from "jotai";
import { subscribeSvgEvent } from "./Svg";
import { sendCommandAtom } from "./command";
import { screenToSvg } from "./screenToSvg";
import { snapXsAtom, snapYsAtom } from "./snap";

export const selectingIdsAtom = atom<string[]>([]);
export const useIsSelecting = (shapeId: string) => {
  const selectingIds = useAtomValue(selectingIdsAtom);
  return selectingIds.includes(shapeId);
};

type StateFn = (e: React.PointerEvent<SVGSVGElement>) =>
  | void // 停止
  | StateFn // 遷移
  | { continue: StateFn }; // 移譲

const stateFnAtom = atom<{ fn: StateFn }>({
  fn: initialState,
});

const selectingEventAtom = atom(
  null,
  (get, set, e: React.PointerEvent<SVGSVGElement>) => {
    let { fn } = get(stateFnAtom);
    // console.group("stateFn", stateFn.name);
    while (fn) {
      const next = fn(e);
      // console.log("next", nextStateFn.name, next);
      // 移譲
      if (next && "continue" in next) {
        fn = next.continue;
        continue;
      }
      // 遷移
      if (next) set(stateFnAtom, { fn: next });
      break;
    }
    // console.groupEnd();
  }
);
subscribeSvgEvent(selectingEventAtom);

const store = getDefaultStore();
function initialState(e: React.PointerEvent<SVGSVGElement>) {
  if (e.type === "pointerdown") {
    return { continue: onPointerDown };
  }
}

let downPoint: { x: number; y: number } | null = null;
// shapeId -> { x: number; y: number }
const startPointMap = new Map<string, { x: number; y: number }>();

const onPointerDown: StateFn = (e) => {
  if (!(e.target instanceof SVGElement)) return;
  const eventTarget = e.target;

  if (e.target.tagName === "svg") return outsideClicked;

  const selectingIds = store.get(selectingIdsAtom);
  const shapeId = eventTarget.id;

  if (selectingIds.includes(shapeId)) {
    // 選択済みの場合
    // metaキーを押してたら消す
    if (e.metaKey) {
      store.set(selectingIdsAtom, (prev) => {
        const set = new Set(prev);
        set.delete(shapeId);
        return Array.from(set);
      });
    }
  } else {
    // 選択済みでない場合
    // metaキーを押してたら追加、押してなかったら置き換え
    if (e.metaKey) {
      store.set(selectingIdsAtom, (prev) => [...prev, shapeId]);
    } else {
      store.set(selectingIdsAtom, [shapeId]);
    }
  }

  downPoint = screenToSvg(e);
  e.target.setPointerCapture(e.pointerId);

  return pointerIsDown;
};

const outsideClicked: StateFn = (e) => {
  switch (e.type) {
    case "pointerup":
      store.set(selectingIdsAtom, []);
      return initialState;
  }
};

const pointerIsDown: StateFn = (e) => {
  switch (e.type) {
    case "pointerup":
      return { continue: onPointerUp };
    case "pointermove":
      return { continue: onBeforePointerMove };
  }
};

const onBeforePointerMove: StateFn = () => {
  // 選択中のshapeの初期位置を記録
  store.get(selectingIdsAtom).forEach((shapeId) => {
    const selectingShape = document.getElementById(shapeId);
    if (!(selectingShape instanceof SVGElement)) return;
    const shapePosition = getShapePosition(selectingShape);
    if (!shapePosition) return;
    startPointMap.set(shapeId, shapePosition);
  });
  return { continue: onPointerMove };
};

const onPointerMove: StateFn = (e) => {
  const selectingIds = store.get(selectingIdsAtom);
  if (selectingIds.length === 0) return;

  if (!downPoint) return;
  const currentPoint = screenToSvg(e);
  const diff = {
    x: currentPoint.x - downPoint.x,
    y: currentPoint.y - downPoint.y,
  };

  selectingIds.forEach((shapeId) => {
    const startPoint = startPointMap.get(shapeId);
    if (!startPoint) return;
    const position = {
      x: startPoint.x + diff.x,
      y: startPoint.y + diff.y,
    };
    const snapPoint = getSnapPoint(shapeId, position);

    store.set(sendCommandAtom, {
      type: "moveShape",
      shapeId,
      position: snapPoint,
    });
  });

  return pointerIsMoving;
};

function getSnapPoint(_shapeId: string, position: { x: number; y: number }) {
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

const pointerIsMoving: StateFn = (e) => {
  switch (e.type) {
    case "pointerup":
      return { continue: onPointerUp };
    case "pointermove":
      return { continue: onPointerMove };
  }
};

const onPointerUp: StateFn = () => {
  return { continue: pointerIsUp };
};
const pointerIsUp: StateFn = () => {
  return initialState;
};

function getShapePosition(target: SVGElement) {
  if (target.tagName === "svg") return null;
  if (!target.dataset.shapePosition) return null;
  try {
    return JSON.parse(target.dataset.shapePosition) as { x: number; y: number };
  } catch (e) {
    console.error(e);
    return null;
  }
}
