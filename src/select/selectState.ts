import { getDefaultStore } from "jotai";
import { sendCommandAtom } from "../command";
import { screenToSvg } from "../screenToSvg";
import { fixToSnap } from "../snap/fixToSnap";
import { subscribeSvgEvent } from "../Svg";
import { selectingIdsAtom } from "./selectStore";
import { shapeAtomFamily } from "../shape/shapeStore";

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

export function registerSelectingEvent() {
  subscribeSvgEvent(onPointerEvent);
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
    const shape = store.get(shapeAtomFamily(shapeId));
    if (!shape) return;
    const startPoint = { x: shape.x, y: shape.y };
    startPointMap.set(shapeId, startPoint);
  });
  return { continue: onPointerMove };
};
const onPointerMove: StateFn = (e) => {
  const selectingIds = store.get(selectingIdsAtom);
  if (selectingIds.length === 0) return;

  if (!downPoint) return;
  const currentPoint = screenToSvg(e);
  const pointerDiff = {
    x: currentPoint.x - downPoint.x,
    y: currentPoint.y - downPoint.y,
  };

  selectingIds.forEach((shapeId) => {
    const startPoint = startPointMap.get(shapeId);
    if (!startPoint) return;
    const position = {
      x: startPoint.x + pointerDiff.x,
      y: startPoint.y + pointerDiff.y,
    };
    const snappedPoint = fixToSnap(shapeId, position);

    store.set(sendCommandAtom, {
      type: "moveShape",
      shapeId,
      position: snappedPoint,
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
