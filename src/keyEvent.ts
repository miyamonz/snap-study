import { atom, useAtomValue } from "jotai";
import { toast } from "./Toast";
import { Shape, shapesAtom } from "./state";
const onKeyEventAtom = atom(null, (get, set, e: KeyboardEvent) => {
  console.log(e.key);
  //  command and delete
  if (e.key === "Backspace" && e.metaKey) {
    return;
  }
  // meta + s
  if (e.key === "s" && e.metaKey) {
    e.preventDefault();
    console.log("meta + s");
    const shapes = get(shapesAtom);
    console.log(shapes);
    navigator.clipboard.writeText(JSON.stringify(shapes));
    toast("meta + s", "info");
    return;
  }

  // meta + v
  if (e.key === "v" && e.metaKey) {
    e.preventDefault();
    console.log("meta + v");
    navigator.clipboard.readText().then((text) => {
      console.log(text);
      try {
        const shapes = JSON.parse(text) as Shape[];
        const randomId = () => Math.random().toString(36).substring(2, 15);
        set(shapesAtom, (prev) => [
          ...prev,
          ...shapes.map((shape: Shape) => ({
            ...shape,
            shapeId: randomId(),
          })),
        ]);
      } catch (e) {
        console.error(e);
        toast("Invalid JSON", "error");
      }
    });
  }
});

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
