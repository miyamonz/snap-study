import { Fragment } from "react/jsx-runtime";
import { useShapes } from "./store";
import type { Shape } from "./type";
import { useIsSelecting } from "../select/store";
import { getSnapPoints } from "./getSnapPoints";
export function Shapes() {
  const shapes = useShapes();

  return (
    <g>
      {shapes.map((shape) => {
        return <ShapeContainer key={shape.shapeId} shape={shape} />;
      })}
    </g>
  );
}
function ShapeContainer({ shape }: { shape: Shape }) {
  const isSelecting = useIsSelecting(shape.shapeId);
  const selectingShape = {
    ...shape,
    stroke: "lightgreen",
    strokeWidth: shape.strokeWidth + 10,
    strokeDasharray: "20 10",
  } satisfies Shape;
  return (
    <Fragment>
      {isSelecting && <Shape shape={selectingShape} />}
      <Shape shape={shape} />
      {isSelecting && <ShapeUI shape={shape} />}
    </Fragment>
  );
}

function Shape({ shape }: { shape: Shape }) {
  switch (shape.type) {
    case "rect":
      return (
        <rect
          id={shape.shapeId}
          data-shape-position={JSON.stringify({
            x: shape.x,
            y: shape.y,
          })}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          strokeDasharray={shape.strokeDasharray}
        />
      );
    case "circle":
      return (
        <circle
          id={shape.shapeId}
          data-shape-position={JSON.stringify({
            x: shape.x,
            y: shape.y,
          })}
          cx={shape.x}
          cy={shape.y}
          r={shape.r}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          strokeDasharray={shape.strokeDasharray}
        />
      );
  }
}

function ShapeUI({ shape }: { shape: Shape }) {
  const snapPoints = getSnapPoints(shape.shapeId);
  return (
    <g className="pointer-events-none">
      {snapPoints.map((snapPoint) => (
        <SnapPointCursor key={snapPoint.name} x={snapPoint.x} y={snapPoint.y} />
      ))}
    </g>
  );
}

function SnapPointCursor({ x, y }: { x: number; y: number }) {
  const w = 10;
  return (
    <g>
      <circle cx={x} cy={y} r={5} stroke="gray" strokeWidth={1} fill="none" />
      <line x1={x - w} y1={y} x2={x + w} y2={y} stroke="gray" />
      <line x1={x} y1={y - w} x2={x} y2={y + w} stroke="gray" />
    </g>
  );
}
