import { atom, getDefaultStore } from "jotai";
import { sendCommandAtom } from "../command";
import { screenToSvg } from "../screenToSvg";
import { getSnapPoint } from "../snap/getSnapPoint";
import { subscribeSvgEvent } from "../Svg";
import { selectingIdsAtom } from "./store";

type StateFn = (e: React.PointerEvent<SVGSVGElement>) =>
  | void // 停止
  | StateFn // 遷移
  | { continue: StateFn }; // 移譲

let stateFn: StateFn = initialState;

function onPointerEvent(e: React.PointerEvent<SVGSVGElement>) {
  while (stateFn) {
    const next = stateFn(e);
    // console.log("next", next);
    // 移譲
    if (next && "continue" in next) {
      stateFn = next.continue;
      continue;
    }
    // 遷移
    if (next) stateFn = next;
    break;
  }
  // console.groupEnd();
}
const selectingEventAtom = atom(
  null,
  (_get, _set, e: React.PointerEvent<SVGSVGElement>) => {
    onPointerEvent(e);
  }
);
export function registerSelectingEvent() {
  subscribeSvgEvent(selectingEventAtom);
}

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
