import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import scenes from "./scenes.json";
import { Molecule, Synapse, Orbs, Chase, Phone, Loop, Network, Steps, P } from "./objects";

const OBJECTS: React.FC<P>[] = [Molecule, Synapse, Orbs, Chase, Phone, Loop, Network, Steps];
const PAL = ["#8c64ff", "#3cb4ff", "#ff64be", "#ffaa3c", "#46dca0", "#ff5a5a", "#6ed2ff", "#be82ff"];
const CAMS = [[0, 0.5, 10], [6, 2, 8], [-6, 2.5, 8], [0, 7, 7.5], [4, -2, 9], [-7, 1, 7]];
const SEG = 90;
const FONT = "Arial, Helvetica, sans-serif";
const TOTAL = scenes.reduce((s, x) => s + x.frames, 0);
const segCount = (fr: number) => Math.max(1, Math.round(fr / SEG));

const dim = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k + 6);
  const g = Math.round(((n >> 8) & 255) * k + 6);
  const b = Math.round((n & 255) * k + 10);
  return `rgb(${r},${g},${b})`;
};

const STAR_POS = (() => {
  const a = new Float32Array(300 * 3);
  let s = 12345;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 300; i++) {
    const rad = 12 + r() * 10, th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1);
    a[i * 3] = rad * Math.sin(ph) * Math.cos(th);
    a[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th);
    a[i * 3 + 2] = rad * Math.cos(ph);
  }
  return a;
})();

const Stars: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <points rotation={[0, f * 0.004, 0]}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[STAR_POS, 3]} />
    </bufferGeometry>
    <pointsMaterial size={0.25} color={color} sizeAttenuation transparent opacity={0.8} />
  </points>
);

const Rig: React.FC<{ seg: number; prog: number }> = ({ seg, prog }) => {
  const { camera } = useThree();
  const c = CAMS[seg % CAMS.length];
  const k = 1 - 0.12 * prog;
  camera.position.set(c[0] * k, c[1] * k, c[2] * k);
  camera.lookAt(0, -1.3, 0);
  return null;
};

const Scene: React.FC<{ index: number; start: number }> = ({ index, start }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sc = scenes[index];
  const nseg = segCount(sc.frames);
  const segLen = sc.frames / nseg;
  const seg = Math.min(nseg - 1, Math.floor(f / segLen));
  const segF = f - seg * segLen;
  let gs = seg;
  for (let i = 0; i < index; i++) gs += segCount(scenes[i].frames);
  const acc = PAL[(gs * 3 + index) % PAL.length];
  const enter = spring({ frame: f, fps, config: { damping: 14, stiffness: 120 } });
  const Obj = OBJECTS[index % OBJECTS.length];

  const words = sc.text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 3) chunks.push(words.slice(i, i + 3).join(" "));
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const t0 = 4;
  const dur = Math.max(1, sc.frames - 22);
  let cum = 0, ci = 0, cs = t0;
  for (let i = 0; i < chunks.length; i++) {
    const s = t0 + dur * (cum / totalLen);
    if (f >= s) { ci = i; cs = s; }
    cum += chunks[i].length;
  }
  const cw = chunks[ci].split(" ");
  const maxw = Math.max(...cw.map((w) => w.length));
  const fs = maxw > 11 ? 54 : maxw > 8 ? 66 : 78;
  const pop = spring({ frame: f - cs, fps, config: { damping: 11, stiffness: 220 } });
  const kp = spring({ frame: f, fps, config: { damping: 12 } });
  const flash = interpolate(segF, [0, 7], [0.5, 0], { extrapolateRight: "clamp" });
  const fade = Math.max(
    interpolate(f, [0, 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(f, [sc.frames - 6, sc.frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{ fov: 60, position: [0, 0.5, 10] }}>
        <color attach="background" args={[dim(acc, 0.1)]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 6]} intensity={2.2} />
        <pointLight position={[-4, -2, 5]} intensity={90} color={acc} />
        <Rig seg={seg} prog={segF / segLen} />
        <Stars f={f} color={acc} />
        <Obj f={f} acc={acc} enter={enter} />
      </ThreeCanvas>

      <div style={{ position: "absolute", top: 100, left: 0, right: 0, textAlign: "center", fontFamily: FONT }}>
        <span style={{ display: "inline-block", padding: "10px 26px", border: `3px solid ${acc}`, borderRadius: 999, color: acc, fontWeight: 800, fontSize: 34, letterSpacing: 6, background: "rgba(0,0,0,0.35)", transform: `scale(${kp})` }}>
          {sc.keyword}
        </span>
      </div>

      <div style={{ position: "absolute", left: 40, right: 40, top: 880, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: fs, lineHeight: 1.1, textTransform: "uppercase", color: "#ffffff", transform: `scale(${0.7 + 0.3 * pop})`, textShadow: `0 0 28px ${acc}, 0 5px 0 rgba(0,0,0,0.65)` }}>
        {cw.map((w, i) => (
          <span key={i} style={{ color: i === cw.length - 1 ? acc : "#ffffff" }}>{w}{" "}</span>
        ))}
      </div>

      <div style={{ position: "absolute", left: 50, right: 50, bottom: 70, height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 4 }}>
        <div style={{ width: `${((start + f) / TOTAL) * 100}%`, height: "100%", background: acc, borderRadius: 4 }} />
      </div>

      <AbsoluteFill style={{ background: "#ffffff", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000000", opacity: fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  let start = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#05050c" }}>
      {scenes.map((s, i) => {
        const from = start;
        start += s.frames;
        return (
          <Sequence key={i} from={from} durationInFrames={s.frames}>
            <Audio src={staticFile(`audio/scene${i}.mp3`)} />
            <Scene index={i} start={from} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
