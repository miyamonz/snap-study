import { DraggingRect } from "./dragEvent";
// import { Coords } from "./Coords";
// import { Pointer } from "./Pointer";
import { Svg } from "./Svg";
import { Shapes } from "./shape/Shapes";
import { ToastContainer } from "./Toast";
import { SnapLines } from "./snap/SnapLines";
import "./select/store";
import { useOnKeyEvent } from "./keyEvent";
function App() {
  useOnKeyEvent();
  return (
    <div className="w-full h-screen flex justify-center items-center relative">
      <ToastContainer />
      <Svg>
        {/* <Coords /> */}
        {/* <Pointer /> */}
        <SnapLines />
        <DraggingRect />
        <Shapes />
      </Svg>
      {/* tool */}
      <div className="absolute bottom-2 w-full h-10 bg-slate-200">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-blue-500">rect</button>
          <button className="w-10 h-10 bg-blue-500">circle</button>
          <button className="w-10 h-10 bg-blue-500">ellipse</button>
          <button className="w-10 h-10 bg-blue-500">line</button>
          <button className="w-10 h-10 bg-blue-500">polyline</button>
          <button className="w-10 h-10 bg-blue-500">polygon</button>
        </div>
      </div>
      {/*  */}
    </div>
  );
}

export default App;
