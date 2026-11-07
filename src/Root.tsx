import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import scenes from "./scenes.json";

const total = scenes.reduce((s, x) => s + x.frames, 0);

export const RemotionRoot: React.FC = () => (
  <Composition id="Dopamine" component={Video} durationInFrames={total} fps={30} width={720} height={1280} />
);
