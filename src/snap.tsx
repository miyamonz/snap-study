import { Fragment } from "react/jsx-runtime";
import { useViewBox } from "./Svg";

export function SnapLine() {
  const { rect } = useViewBox();

  const points = [
    { x: 130, y: 100 },
    { x: 200, y: 230 },
  ];
  return (
    <>
      {points.map((point) => (
        <Fragment key={`${point.x}-${point.y}`}>
          {/* x */}
          <line
            x1={point.x}
            y1={rect.y}
            x2={point.x}
            y2={rect.y + rect.height}
            stroke="green"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          {/* y */}
          <line
            x1={rect.x}
            y1={point.y}
            x2={rect.x + rect.width}
            y2={point.y}
            stroke="green"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        </Fragment>
      ))}
    </>
  );
}
