import { useViewBox } from "./Svg";

export function Coords() {
  const { rect } = useViewBox();

  const xs = interval(rect.x, rect.x + rect.width, 100);
  const ys = interval(rect.y, rect.y + rect.height, 100);
  return (
    <>
      <circle cx={0} cy={0} r={10} fill="black" />
      <text
        x={10}
        y={10}
        fontSize={24}
        fill="gray"
        textAnchor="start"
        dominantBaseline="hanging"
        className=" select-none"
      >
        x:{Math.round(rect.x) + "  "}
        y:{Math.round(rect.y) + "  "}
        w:{Math.round(rect.width) + "  "}
        h:{Math.round(rect.height) + "  "}
      </text>
      {Array.from(xs).map((x) => (
        <line
          key={x}
          stroke="lightgray"
          x1={x}
          y1={rect.y}
          x2={x}
          y2={rect.y + rect.height}
          className="pointer-events-none"
        />
      ))}
      {Array.from(ys).map((y) => (
        <line
          key={y}
          stroke="lightgray"
          x1={rect.x}
          y1={y}
          x2={rect.x + rect.width}
          y2={y}
          className="pointer-events-none"
        />
      ))}
    </>
  );
}

function* interval(start: number, end: number, interval: number) {
  // intervalの定数倍を返す
  const first = Math.floor(start / interval) * interval - interval;
  const last = Math.floor(end / interval) * interval + interval;
  for (let i = first; i <= last; i += interval) {
    yield i;
  }
}
