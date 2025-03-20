import { atom, useAtomValue, useSetAtom } from "jotai";

const pointerPositionAtom = atom({ x: 0, y: 0 });
export const usePointerPosition = () => useAtomValue(pointerPositionAtom);
export const useSetPointerPosition = () => useSetAtom(pointerPositionAtom);
