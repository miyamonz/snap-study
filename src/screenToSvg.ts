export const screenToSvg = (e: { clientX: number; clientY: number }) => {
  const svg = document.querySelector("svg")!;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM()?.inverse());
  return { x: p.x, y: p.y };
};

export const screenToSvgRect = (rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  const svg = document.querySelector("svg")!;
  const pt = svg.createSVGPoint();
  pt.x = rect.x;
  pt.y = rect.y;
  const mat = svg.getScreenCTM()!;
  const p = pt.matrixTransform(mat.inverse());
  const width = rect.width / mat.a;
  const height = rect.height / mat.d;
  return { x: p.x, y: p.y, width, height };
};
