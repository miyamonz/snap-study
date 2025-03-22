import { DraggingRect, registerDragEvent } from "./select/dragEvent";
// import { Coords } from "./Coords";
// import { Pointer } from "./Pointer";
import { Svg } from "./Svg";
import { Shapes } from "./shape/Shapes";
import { ToastContainer } from "./Toast";
import { SnapLines } from "./snap/SnapLines";
import { registerSnapEvent } from "./snap/state";
import { registerSelectingEvent } from "./select/state";
import { useOnKeyEvent } from "./keyEvent";

registerSelectingEvent();
registerDragEvent();
registerSnapEvent();

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
      {/* <div className="absolute bottom-2 w-full h-10 bg-slate-200">
        <Tool />
      </div> */}
    </div>
  );
}
// function Tool() {
//   return (
//     <>
//       <div className="flex items-center gap-2">
//         <button className="w-10 h-10 bg-blue-500">rect</button>
//         <button className="w-10 h-10 bg-blue-500">circle</button>
//         <button className="w-10 h-10 bg-blue-500">ellipse</button>
//         <button className="w-10 h-10 bg-blue-500">line</button>
//         <button className="w-10 h-10 bg-blue-500">polyline</button>
//         <button className="w-10 h-10 bg-blue-500">polygon</button>
//       </div>
//     </>
//   );
// }

export default App;
