import { atom, useAtomValue } from "jotai";
import { toast } from "./Toast";
import { Shape } from "./shape/type";
import { shapesAtom } from "./shape/store";
import { selectingIdsAtom } from "./select/store";
import { sendCommandAtom } from "./command";

const selectingShapesAtom = atom((get) => {
  const shapes = get(shapesAtom);
  const selectingIds = get(selectingIdsAtom);
  return shapes.filter((shape) => selectingIds.includes(shape.shapeId));
});

const onKeyEventAtom = atom(null, (get, set, e: KeyboardEvent) => {
  console.log(e.key);

  // meta + a
  if (e.key === "a" && e.metaKey) {
    e.preventDefault();
    const shapes = get(shapesAtom);
    set(
      selectingIdsAtom,
      shapes.map((shape) => shape.shapeId)
    );
    return;
  }
  // meta + s
  if (e.key === "s" && e.metaKey) {
    e.preventDefault();
    console.log("meta + s");
    const shapes = get(shapesAtom);
    console.log(shapes);
    navigator.clipboard.writeText(JSON.stringify(shapes));
    toast("copy all shapes to clipboard", "info");
    return;
  }

  // meta + c
  if (e.key === "c" && e.metaKey) {
    e.preventDefault();
    const shapes = get(selectingShapesAtom);
    if (shapes.length === 0) return;
    navigator.clipboard.writeText(JSON.stringify(shapes));
    return;
  }

  // meta + v
  if (e.key === "v" && e.metaKey) {
    e.preventDefault();
    set(paseShapesAtom);
    return;
  }

  if (e.key === "Backspace" && e.metaKey) {
    e.preventDefault();
    const shapes = get(selectingIdsAtom);
    if (shapes.length === 0) return;
    set(sendCommandAtom, { type: "deleteShape", shapeIds: shapes });
    set(selectingIdsAtom, []);
    return;
  }
});

const paseShapesAtom = atom(null, async (get, set) => {
  console.log("shapes pasted");
  const shapes = (await getFromClipboard()) as Shape[] | null;
  if (!shapes) return;

  // commandが返り値を得られるといいのだが
  const prevShapes = get(shapesAtom);
  set(sendCommandAtom, { type: "addShape", shapes: shapes });
  const nextShapes = get(shapesAtom);

  const newShapes = nextShapes.filter((shape) => !prevShapes.includes(shape));
  // 追加したshapeを選択状態にする
  set(
    selectingIdsAtom,
    newShapes.map((shape) => shape.shapeId)
  );
});

async function getFromClipboard() {
  const text = await navigator.clipboard.readText();
  try {
    return JSON.parse(text) as unknown;
  } catch (e) {
    console.error(e);
    toast("Invalid JSON", "error");
    return null;
  }
}

onKeyEventAtom.onMount = (set) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    set(e);
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
};

export const useOnKeyEvent = () => {
  useAtomValue(onKeyEventAtom);
};
