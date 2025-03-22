import { useAtomValue } from "jotai";
import {
  snapXsAtom,
  snapYsAtom,
  type SnapHandle,
  snappedShapesXsAtomFamily,
  snappedShapesYsAtomFamily,
} from "./store";
import { useViewBox } from "../Svg";

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
  // if (snappedShapes.length <= 1) return null;
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

export function getSnapHandle(target: SVGElement) {
  const snapHandle = target.dataset.snapHandle;
  if (!snapHandle) return null;
  try {
    return JSON.parse(snapHandle) as SnapHandle;
  } catch {
    return null;
  }
}
