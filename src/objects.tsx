import React from "react";
import * as THREE from "three";

export type P = { f: number; acc: string; enter: number };

const Mat: React.FC<{ c: string; k?: number }> = ({ c, k = 0.7 }) => (
  <meshStandardMaterial color={c} emissive={c} emissiveIntensity={k} roughness={0.4} metalness={0.2} />
);

const Atom: React.FC<{ p: number[]; r: number; c: string }> = ({ p, r, c }) => (
  <mesh position={[p[0], p[1], p[2]]}>
    <sphereGeometry args={[r, 24, 24]} />
    <Mat c={c} />
  </mesh>
);

const Bond: React.FC<{ a: number[]; b: number[]; color: string }> = ({ a, b, color }) => {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.07, 0.07, len, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  );
};

export const Molecule: React.FC<P> = ({ f, acc, enter }) => {
  const ring: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2;
    ring.push([Math.cos(t) * 1.1, Math.sin(t) * 1.1, 0]);
  }
  const c1 = [2.3, 0, 0], c2 = [3.1, 0.9, 0.2], n = [4.1, 0.5, 0.3];
  const oh1 = [ring[2][0] * 1.75, ring[2][1] * 1.75, 0];
  const oh2 = [ring[3][0] * 1.75, 0, 0];
  return (
    <group scale={enter * 0.8} rotation={[0.25, Math.sin(f * 0.03) * 0.7, f * 0.004]}>
      <group position={[-1.5, 0, 0]}>
        {ring.map((p, i) => (
          <React.Fragment key={i}>
            <Atom p={p} r={0.28} c={acc} />
            <Bond a={p} b={ring[(i + 1) % 6]} color="#dfe6ff" />
          </React.Fragment>
        ))}
        <Atom p={c1} r={0.24} c={acc} />
        <Atom p={c2} r={0.24} c={acc} />
        <Atom p={n} r={0.3} c="#6ea8ff" />
        <Atom p={oh1} r={0.26} c="#ff6b6b" />
        <Atom p={oh2} r={0.26} c="#ff6b6b" />
        <Bond a={ring[0]} b={c1} color="#dfe6ff" />
        <Bond a={c1} b={c2} color="#dfe6ff" />
        <Bond a={c2} b={n} color="#dfe6ff" />
        <Bond a={ring[2]} b={oh1} color="#dfe6ff" />
        <Bond a={ring[3]} b={oh2} color="#dfe6ff" />
      </group>
    </group>
  );
};

export const Synapse: React.FC<P> = ({ f, acc, enter }) => {
  const parts: React.ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    const ph = (f * 0.018 + i / 26) % 1;
    const x = -1.05 + ph * 2.1;
    const w = Math.sin(ph * Math.PI);
    const y = Math.sin(i * 12.9898) * 0.7 * (0.25 + 0.75 * w);
    const z = Math.cos(i * 7.233) * 0.6 * w;
    parts.push(
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <Mat c={acc} k={1.2} />
      </mesh>
    );
  }
  return (
    <group scale={enter}>
      <mesh position={[-1.9, 0, 0]} scale={1 + 0.05 * Math.sin(f * 0.2)}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <Mat c="#9aa7ff" k={0.5} />
      </mesh>
      <mesh position={[1.9, 0, 0]} scale={1 + 0.05 * Math.sin(f * 0.2 + 2)}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <Mat c="#ff9ad5" k={0.5} />
      </mesh>
      {[-0.55, 0, 0.55].map((y, i) => (
        <mesh key={i} position={[1.2, y, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.3]} />
          <Mat c={acc} k={1} />
        </mesh>
      ))}
      {parts}
    </group>
  );
};

export const Orbs: React.FC<P> = ({ f, acc, enter }) => {
  const a = f * 0.035;
  const big = 0.85 + 0.12 * Math.sin(f * 0.15);
  return (
    <group scale={enter}>
      <mesh position={[Math.cos(a) * 1.5, Math.sin(a) * 0.9, Math.sin(a) * 1.2]}>
        <sphereGeometry args={[big, 32, 32]} />
        <Mat c={acc} k={1.1} />
      </mesh>
      <mesh position={[Math.cos(a + Math.PI) * 1.5, Math.sin(a + Math.PI) * 0.9, Math.sin(a + Math.PI) * 1.2]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <Mat c="#ffffff" k={0.5} />
      </mesh>
      <mesh rotation={[1.2, 0, f * 0.03]}>
        <torusGeometry args={[1.7, 0.03, 8, 80]} />
        <Mat c={acc} k={1} />
      </mesh>
    </group>
  );
};

export const Chase: React.FC<P> = ({ f, acc, enter }) => {
  const x = 2.0 * Math.sin(f * 0.045);
  const bob = 0.25 * Math.sin(f * 0.2);
  const cx = 2.0 * Math.sin(f * 0.045 - 0.9);
  const trail: React.ReactNode[] = [];
  for (let i = 1; i <= 8; i++) {
    const tx = 2.0 * Math.sin(f * 0.045 - i * 0.12);
    trail.push(
      <mesh key={i} position={[tx, bob, 0]} scale={1 - i * 0.1}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <Mat c={acc} k={0.8} />
      </mesh>
    );
  }
  return (
    <group scale={enter}>
      <mesh position={[x, bob, 0]} rotation={[f * 0.05, f * 0.07, 0]}>
        <octahedronGeometry args={[0.55]} />
        <Mat c="#ffd166" k={1.3} />
      </mesh>
      {trail}
      <mesh position={[cx, -0.95 + Math.abs(bob), 0]} rotation={[0, 0, f * 0.03]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <Mat c="#ffffff" k={0.4} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[4.8, 0.05, 0.4]} />
        <Mat c={acc} k={0.6} />
      </mesh>
    </group>
  );
};

export const Phone: React.FC<P> = ({ f, acc, enter }) => {
  const rings: React.ReactNode[] = [];
  for (let k = 0; k < 4; k++) {
    const ph = (f * 0.02 + k / 4) % 1;
    rings.push(
      <mesh key={k} scale={0.6 + ph * 2.4} position={[0, 0, -0.2]}>
        <torusGeometry args={[1, 0.035, 8, 64]} />
        <meshBasicMaterial color={acc} transparent opacity={1 - ph} />
      </mesh>
    );
  }
  const pulse = 0.6 + 0.4 * Math.sin(f * 0.25);
  return (
    <group scale={enter} rotation={[0.1, Math.sin(f * 0.03) * 0.5, 0]}>
      <mesh>
        <boxGeometry args={[1.4, 2.5, 0.2]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.2, 2.25]} />
        <meshStandardMaterial color={acc} emissive={acc} emissiveIntensity={pulse} />
      </mesh>
      <mesh position={[0, 0.7, 0.13]}>
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {rings}
    </group>
  );
};

export const Loop: React.FC<P> = ({ f, acc, enter }) => {
  const cols = [acc, "#ffffff", "#ffd166"];
  return (
    <group scale={enter} rotation={[0.9, 0, 0]}>
      <mesh rotation={[f * 0.01, f * 0.02, 0]}>
        <torusKnotGeometry args={[1.0, 0.09, 140, 12, 2, 3]} />
        <Mat c={acc} k={0.9} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.3, 0.02, 8, 100]} />
        <Mat c="#8890b8" k={0.4} />
      </mesh>
      {cols.map((c, k) => {
        const a = f * 0.05 + k * 2.094;
        return (
          <mesh key={k} position={[Math.cos(a) * 2.3, Math.sin(a) * 2.3, 0]}>
            <sphereGeometry args={[0.28, 20, 20]} />
            <Mat c={c} k={1.1} />
          </mesh>
        );
      })}
    </group>
  );
};

const NET = (() => {
  const n = 64;
  const pts: number[][] = [];
  for (let k = 0; k < n; k++) {
    const y = 1 - (2 * (k + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const th = k * 2.399963;
    pts.push([Math.cos(th) * r * 2.2, y * 2.2, Math.sin(th) * r * 2.2]);
  }
  const segs: THREE.Vector3[] = [];
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const dx = pts[a][0] - pts[b][0], dy = pts[a][1] - pts[b][1], dz = pts[a][2] - pts[b][2];
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.25) {
        segs.push(new THREE.Vector3(pts[a][0], pts[a][1], pts[a][2]));
        segs.push(new THREE.Vector3(pts[b][0], pts[b][1], pts[b][2]));
      }
    }
  }
  const geo = new THREE.BufferGeometry().setFromPoints(segs);
  return { pts, geo };
})();

export const Network: React.FC<P> = ({ f, acc, enter }) => (
  <group scale={enter} rotation={[0.3, f * 0.02, 0]}>
    <lineSegments geometry={NET.geo}>
      <lineBasicMaterial color={acc} transparent opacity={0.55} />
    </lineSegments>
    {NET.pts.map((p, i) => {
      const w = Math.max(0, Math.sin(f * 0.12 - i * 0.45));
      return (
        <mesh key={i} position={[p[0], p[1], p[2]]} scale={1 + 1.2 * w}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <Mat c={w > 0.6 ? "#ffffff" : acc} k={0.6 + w} />
        </mesh>
      );
    })}
  </group>
);

export const Steps: React.FC<P> = ({ f, acc, enter }) => {
  const bars: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const t = Math.min(1, Math.max(0, (f - 6 - i * 9) / 20));
    const e = 1 - Math.pow(1 - t, 3);
    const h = (0.6 + i * 0.55) * Math.max(0.001, e);
    bars.push(
      <mesh key={i} position={[-1.8 + i * 0.9, -1.2 + h / 2, 0]}>
        <boxGeometry args={[0.75, h, 0.75]} />
        <Mat c={i === 4 ? "#ffd166" : acc} k={0.8} />
      </mesh>
    );
  }
  const s = 1 + 0.08 * Math.sin(f * 0.2);
  return (
    <group scale={enter}>
      {bars}
      <mesh position={[1.7, 2.4, -0.5]} scale={s}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <Mat c="#ffd166" k={1.4} />
      </mesh>
      <mesh position={[1.7, 2.4, -0.5]} rotation={[1.2, 0.3, f * 0.04]}>
        <torusGeometry args={[0.95, 0.03, 8, 60]} />
        <Mat c="#ffd166" k={1} />
      </mesh>
    </group>
  );
};
