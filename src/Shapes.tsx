import { Fragment } from "react/jsx-runtime";
import { useShapes } from "./state";
import type { Shape } from "./state";
import { useIsSelecting } from "./selectingEvent";
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
  const w = 10;
  return (
    <g className="pointer-events-none">
      <circle
        cx={shape.x}
        cy={shape.y}
        r={5}
        stroke="gray"
        strokeWidth={1}
        fill="none"
      />
      <line
        x1={shape.x - w}
        y1={shape.y}
        x2={shape.x + w}
        y2={shape.y}
        stroke="gray"
      />
      <line
        x1={shape.x}
        y1={shape.y - w}
        x2={shape.x}
        y2={shape.y + w}
        stroke="gray"
      />
    </g>
  );
}
