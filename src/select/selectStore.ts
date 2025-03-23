import { atom, useAtomValue } from "jotai";

export const selectingIdsAtom = atom<string[]>([]);
export const useIsSelecting = (shapeId: string) => {
  const selectingIds = useAtomValue(selectingIdsAtom);
  return selectingIds.includes(shapeId);
};
