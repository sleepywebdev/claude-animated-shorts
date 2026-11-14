import React from "react";
import {Composition} from "remotion";
import {BridgeShort, BRIDGE_FRAMES} from "./videos/bridge/Bridge";
import {EmuWarOpening} from "./videos/emu/EmuWarOpening";
import {BunkerSurvival, BUNKER_FRAMES} from "./videos/bunker/BunkerSurvival";
export const Root: React.FC = () => (
 <>
  <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920}/>
  <Composition id="EmuWarOpening" component={EmuWarOpening} durationInFrames={36} fps={30} width={1080} height={1920}/>
  <Composition id="BunkerSurvival" component={BunkerSurvival} durationInFrames={BUNKER_FRAMES} fps={30} width={1080} height={1920}/>
 </>
);
