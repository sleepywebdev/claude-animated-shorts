import React from "react";
import {Composition} from "remotion";
import {BridgeShort, BRIDGE_FRAMES} from "./videos/bridge/Bridge";
import {EmuWarOpening} from "./videos/emu/EmuWarOpening";
export const Root: React.FC = () => (
 <>
  <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="EmuWarOpening" component={EmuWarOpening} durationInFrames={126} fps={30} width={1080} height={1920}/>
 </>
);
