export type Shape = Rect | Circle;

type Identity = {
  shapeId: string;
};
type Style = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
};
type Rect = Identity & {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
} & Style;

type Circle = Identity & {
  type: "circle";
  x: number;
  y: number;
  r: number;
} & Style;
