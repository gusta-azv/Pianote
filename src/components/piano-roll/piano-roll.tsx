import { PianoKeyboard } from "./piano-keyboard";
import { PianoViewport } from "./piano-viewport";

export const PianoRoll = () => {
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <PianoViewport />
      <PianoKeyboard />
    </div>
  );
};
