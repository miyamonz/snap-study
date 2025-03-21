import { atom, useAtomValue, useSetAtom } from "jotai";

import { useSetPointerPosition } from "./pointerPosition";
import { screenToSvg } from "./screenToSvg";
import { useEffect, useRef, useState } from "react";
import { WritableAtom } from "jotai";

// disable body zoom
document.body.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false }
);

export function Svg({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const setRect = useSetAtom(baseRectAtom);
  useEffect(() => {
    const updateDimensions = (entries: ResizeObserverEntry[]) => {
      if (entries && entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
        setRect((prev) => ({ ...prev, width, height }));
      }
    };
    const resizeObserver = new ResizeObserver(updateDimensions);

    if (ref.current) {
      resizeObserver.observe(ref.current);

      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
      setRect((prev) => ({ ...prev, width, height }));
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [setRect]);
  return (
    <div ref={ref} className="w-full h-full relative">
      <Svg_
        width={dimensions.width}
        height={dimensions.height}
        className="border border-slate-500 select-none"
      >
        {children}
      </Svg_>
    </div>
  );
}

const centerAtom = atom({
  x: 1200 / 2,
  y: 800 / 2,
});
const scaleAtom = atom(1);
export function useViewBoxScale() {
  return useAtomValue(scaleAtom);
}

export function useResetZoom() {
  const setScale = useSetAtom(scaleAtom);
  const setCenter = useSetAtom(centerAtom);
  return () => {
    setScale(1);
    setCenter({
      x: 1200 / 2,
      y: 800 / 2,
    });
  };
}
const baseRectAtom = atom({
  width: 1200,
  height: 800,
});
const viewBoxAtom = atom((get) => {
  const center = get(centerAtom);
  const scale = get(scaleAtom);
  const rect = get(baseRectAtom);
  return {
    x: center.x - (rect.width / 2) * scale,
    y: center.y - (rect.height / 2) * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
});
export function useViewBox() {
  const viewBox = useAtomValue(viewBoxAtom);
  const scale = useAtomValue(scaleAtom);

  return {
    rect: viewBox,
    scale,
    viewBox: `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`,
  };
}
function useViewBoxHandleWheel() {
  const scale = useAtomValue(scaleAtom);
  const setScale = useSetAtom(scaleAtom);
  const setCenter = useSetAtom(centerAtom);

  return (e: React.WheelEvent<SVGSVGElement>) => {
    const { deltaX, deltaY } = e;
    if (e.ctrlKey) {
      // zoom
      const deltaScale = (100 + deltaY) / 100;
      setScale((prev) => prev * deltaScale);
    } else {
      setCenter((prev) => ({
        x: prev.x + deltaX * scale,
        y: prev.y + deltaY * scale,
      }));
    }
  };
}

function Svg_({
  children,
  ...rest
}: { children: React.ReactNode } & React.SVGProps<SVGSVGElement>) {
  const setPointerPosition = useSetPointerPosition();
  const { viewBox } = useViewBox();
  const handleWheel = useViewBoxHandleWheel();
  const setSvgPointerEvent = useSetAtom(svgPointerEventAtom);
  return (
    <svg
      {...rest}
      className="touch-none"
      viewBox={viewBox}
      onWheel={handleWheel}
      onPointerDown={(e) => {
        setSvgPointerEvent(e);
      }}
      onPointerMove={(e) => {
        const pointer = screenToSvg(e);
        setPointerPosition(pointer);
        setSvgPointerEvent(e);
      }}
      onPointerUp={(e) => {
        setSvgPointerEvent(e);
      }}
    >
      {children}
    </svg>
  );
}

const svgPointerEventAtom = atom(
  null,
  (_get, set, e: React.PointerEvent<SVGSVGElement>) => {
    listenerAtom.forEach((atom) => {
      set(atom, e);
    });
  }
);
type SubscribedAtom = WritableAtom<
  unknown,
  [e: React.PointerEvent<SVGSVGElement>],
  void
>;
const listenerAtom = new Set<SubscribedAtom>();
export function subscribeSvgEvent(atom: SubscribedAtom) {
  listenerAtom.add(atom);
}
