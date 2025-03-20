import { usePointerPosition } from "./pointerPosition";

export function Pointer() {
  const { x, y } = usePointerPosition();
  return (
    <circle
      cx={x}
      cy={y}
      r={10}
      fill="none"
      stroke="black"
      strokeWidth={1}
      className="pointer-events-none"
    />
  );
}
