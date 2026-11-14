import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";

export const BUNKER_FRAMES = 1200;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const Segment: React.FC<{ a: [number, number]; b: [number, number]; color?: string; radius?: number }> = ({ a, b, color = "#20232b", radius = 0.055 }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const length = Math.hypot(dx, dy);
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]} rotation={[0, 0, -Math.atan2(dx, dy)]}>
      <cylinderGeometry args={[radius, radius, length, 10]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
};

/** Flat, hand-built vector stick figure. The character is deliberately graphic, not a 3D human. */
const Stickman: React.FC<{ x: number; y?: number; z: number; scale?: number; zombie?: boolean; pose?: number }> = ({ x, y = 0, z, scale = 1, zombie = false, pose = 0 }) => {
  const ink = "#171923";
  const skin = zombie ? "#a8b98a" : "#fff0d8";
  const shirt = zombie ? "#5b6250" : "#e45c43";
  const armA: [number, number] = pose ? [-0.55, 1.28] : [-0.48, 1.35];
  const armB: [number, number] = pose ? [0.72, 1.52] : [0.5, 1.28];
  return (
    <group position={[x, y, z]} scale={scale}>
      <Segment a={[0, 1.28]} b={[0, 0.73]} color={ink} radius={0.075} />
      <mesh position={[0, 1.62, 0.015]}>
        <circleGeometry args={[0.245, 32]} />
        <meshBasicMaterial color={skin} />
      </mesh>
      <mesh position={[0, 1.62, -0.005]}>
        <torusGeometry args={[0.245, 0.026, 8, 32]} />
        <meshBasicMaterial color={ink} />
      </mesh>
      <mesh position={[-0.075, 1.67, 0.04]}><circleGeometry args={[0.025, 12]} /><meshBasicMaterial color={ink} /></mesh>
      <mesh position={[0.075, 1.67, 0.04]}><circleGeometry args={[0.025, 12]} /><meshBasicMaterial color={ink} /></mesh>
      {zombie && <mesh position={[0, 1.54, 0.045]}><boxGeometry args={[0.12, 0.018, 0.01]} /><meshBasicMaterial color="#7e2829" /></mesh>}
      <mesh position={[0, 1.02, 0.025]}><capsuleGeometry args={[0.16, 0.34, 4, 8]} /><meshStandardMaterial color={shirt} roughness={0.9} /></mesh>
      <Segment a={[0, 0.77]} b={[-0.28, 0.08]} radius={0.065} />
      <Segment a={[0, 0.77]} b={[0.3, 0.08]} radius={0.065} />
      <Segment a={[0, 1.26]} b={armA} radius={0.06} />
      <Segment a={[0, 1.26]} b={armB} radius={0.06} />
      <mesh position={[-0.28, 0.055, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color={ink} /></mesh>
      <mesh position={[0.3, 0.055, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color={ink} /></mesh>
      <mesh position={[armA[0], armA[1], 0]}><sphereGeometry args={[0.075, 10, 8]} /><meshStandardMaterial color={skin} /></mesh>
      <mesh position={[armB[0], armB[1], 0]}><sphereGeometry args={[0.075, 10, 8]} /><meshStandardMaterial color={skin} /></mesh>
      {!zombie && <group position={[-0.23, 0.94, -0.13]}><mesh><boxGeometry args={[0.28, 0.38, 0.2]} /><meshStandardMaterial color="#354b59" roughness={0.95} /></mesh><mesh position={[0, -0.21, 0.02]}><boxGeometry args={[0.34, 0.07, 0.23]} /><meshStandardMaterial color="#c49a5a" /></mesh></group>}
    </group>
  );
};

const BoltRing: React.FC<{ radius: number; count: number; z: number }> = ({ radius, count, z }) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return <mesh key={i} position={[Math.cos(a) * radius, 2.5 + Math.sin(a) * radius, z]} rotation={[Math.PI / 2, 0, a]}>
        <cylinderGeometry args={[0.065, 0.065, 0.075, 8]} />
        <meshStandardMaterial color="#aeb8c0" metalness={0.82} roughness={0.3} />
      </mesh>;
    })}
  </>
);

const Pipe: React.FC<{ a: [number, number, number]; b: [number, number, number]; radius?: number; color?: string }> = ({ a, b, radius = 0.08, color = "#596875" }) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const dir = vb.clone().sub(va);
  return <mesh position={mid.toArray()} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
    <cylinderGeometry args={[radius, radius, dir.length(), 12]} />
    <meshStandardMaterial color={color} metalness={0.72} roughness={0.36} />
  </mesh>;
};

const BunkerWorld: React.FC = () => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const doorOpen = smooth(255, 345, f) * 1.45;
  const enter = smooth(340, 570, f);
  const tension = smooth(650, 810, f);
  const camX = THREE.MathUtils.lerp(8.5, 0.2, enter);
  const camY = THREE.MathUtils.lerp(6.2, 2.8, enter);
  const camZ = THREE.MathUtils.lerp(18.5, 5.6, enter);
  camera.position.set(camX, camY + Math.sin(f / 75) * 0.035, camZ);
  camera.lookAt(0, THREE.MathUtils.lerp(2.2, 2.35, enter), THREE.MathUtils.lerp(-0.8, -4.6, enter));
  camera.updateProjectionMatrix();

  const concrete = useMemo(() => {
    const n = 128, data = new Uint8Array(n * n * 4);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      const v = 112 + Math.round(20 * Math.sin(x * 0.31) * Math.cos(y * 0.27) + 13 * Math.sin((x + y) * 0.71));
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
    }
    const t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
    return t;
  }, []);
  const concreteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c3c5c3", map: concrete, roughness: 0.92 }), [concrete]);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#34414b", metalness: 0.86, roughness: 0.27 }), []);
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#454b50", roughness: 0.88 }), []);
  const alarmOn = f > 790 && Math.floor(f / 12) % 2 === 0;

  return (
    <>
      <color attach="background" args={["#111c2c"]} />
      <fog attach="fog" args={["#172536", 17, 42]} />
      <ambientLight intensity={0.48} color="#8fa6c4" />
      <directionalLight position={[-8, 12, 8]} intensity={2.2} color="#ffbd86" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[0, 4, 3]} intensity={2.4} color="#ff7d48" distance={17} />
      <pointLight position={[0, 3.6, -6]} intensity={1.8} color={alarmOn ? "#ff1717" : "#5a9bce"} distance={12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[90, 90, 1, 1]} />
        <meshStandardMaterial color="#343b3a" roughness={1} />
      </mesh>
      {/* Cutaway bunker shell: the four concrete sections leave a real opening for the blast door. */}
      <mesh position={[-3.55, 2.9, -4.4]} material={concreteMat} castShadow receiveShadow><boxGeometry args={[3.9, 5.8, 1.2]} /></mesh>
      <mesh position={[3.55, 2.9, -4.4]} material={concreteMat} castShadow receiveShadow><boxGeometry args={[3.9, 5.8, 1.2]} /></mesh>
      <mesh position={[0, 5.25, -4.4]} material={concreteMat} castShadow receiveShadow><boxGeometry args={[3.2, 1.1, 1.2]} /></mesh>
      <mesh position={[0, 0.35, -4.4]} material={concreteMat} castShadow receiveShadow><boxGeometry args={[3.2, 0.7, 1.2]} /></mesh>
      <mesh position={[0, 5.95, -4.4]} material={concreteMat} castShadow receiveShadow><boxGeometry args={[11.2, 0.45, 9.2]} /></mesh>
      <mesh position={[-5.2, 2.9, -8.7]} material={concreteMat}><boxGeometry args={[0.5, 5.8, 8.6]} /></mesh>
      <mesh position={[5.2, 2.9, -8.7]} material={concreteMat}><boxGeometry args={[0.5, 5.8, 8.6]} /></mesh>
      <mesh position={[0, 0.05, -8.7]} material={floorMat} receiveShadow><boxGeometry args={[10.5, 0.25, 9]} /></mesh>
      <mesh position={[0, 2.9, -13.1]} material={concreteMat}><boxGeometry args={[10.5, 5.8, 0.45]} /></mesh>

      {/* Exterior retaining wall and earth-covered roof. */}
      <mesh position={[0, 6.1, -4.5]}><boxGeometry args={[12.2, 0.5, 10.4]} /><meshStandardMaterial color="#59624b" roughness={1} /></mesh>
      <mesh position={[0, 6.25, -4.4]} scale={[6.5, 1.25, 5.4]}><sphereGeometry args={[1, 36, 22]} /><meshStandardMaterial color="#38483b" roughness={1} /></mesh>
      {/* The aperture is kept clear by a cutaway facade. Door swings on a heavy offset hinge. */}
      <mesh position={[-5.65, 2.8, -3.55]} material={concreteMat}><boxGeometry args={[0.35, 5.6, 0.6]} /></mesh>
      <mesh position={[5.65, 2.8, -3.55]} material={concreteMat}><boxGeometry args={[0.35, 5.6, 0.6]} /></mesh>
      <mesh position={[0, 5.55, -3.55]} material={concreteMat}><boxGeometry args={[11.3, 0.45, 0.6]} /></mesh>
      <mesh position={[0, 0.35, -3.55]} material={concreteMat}><boxGeometry args={[11.3, 0.55, 0.6]} /></mesh>

      <group position={[-1.65, 2.55, -3.3]} rotation={[0, -doorOpen, 0]}>
        <mesh position={[1.65, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.62, 1.62, 0.34, 64]} />
          <meshStandardMaterial color="#26323d" metalness={0.9} roughness={0.24} />
        </mesh>
        <mesh position={[1.65, 0, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.43, 0.085, 12, 64]} />
          <meshStandardMaterial color="#aab5bd" metalness={0.92} roughness={0.22} />
        </mesh>
        <mesh position={[1.65, 0, 0.205]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.82, 0.035, 8, 48]} />
          <meshStandardMaterial color="#75838d" metalness={0.9} roughness={0.26} />
        </mesh>
        <mesh position={[1.65, 0, 0.22]}><boxGeometry args={[0.16, 1.35, 0.13]} /><meshStandardMaterial color="#89959c" metalness={0.9} roughness={0.24} /></mesh>
        <BoltRing radius={1.49} count={16} z={0.24} />
      </group>
      {/* Hinge blocks, locking pistons, warning lamps. */}
      <Pipe a={[-1.82, 1.05, -3.05]} b={[-1.82, 4.05, -3.05]} radius={0.13} color="#7d8991" />
      <Pipe a={[-1.95, 1.2, -3.0]} b={[-1.95, 1.75, -3.0]} radius={0.19} color="#b4a17e" />
      <mesh position={[1.95, 4.5, -3.0]}><sphereGeometry args={[0.14, 16, 12]} /><meshStandardMaterial color={alarmOn ? "#ff1b1b" : "#d7a34e"} emissive={alarmOn ? "#ff0000" : "#7a3b05"} emissiveIntensity={alarmOn ? 5 : 0.7} /></mesh>

      {/* Interior: service racks, bunks, provisions, generator and filtration hardware. */}
      {[-4.55, 4.55].map((x) => <group key={x} position={[x, 1.65, -8.2]}>
        <mesh material={steel}><boxGeometry args={[0.16, 3.2, 0.22]} /></mesh>
        {[-1, 0, 1].map((y) => <mesh key={y} position={[0, y * 0.9, 0.2]}><boxGeometry args={[0.95, 0.08, 0.75]} /><meshStandardMaterial color="#7b6650" roughness={0.82} /></mesh>)}
        {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[(i % 2) * 0.36 - 0.18, -1.15 + Math.floor(i / 2) * 0.28, 0.34]}><boxGeometry args={[0.27, 0.22, 0.32]} /><meshStandardMaterial color={i % 3 ? "#7b8b63" : "#c49b5d"} roughness={0.7} /></mesh>)}
      </group>)}
      <group position={[0, 0.95, -10.2]}>
        <mesh material={steel}><boxGeometry args={[1.8, 1.45, 1.2]} /></mesh>
        <mesh position={[0, 0.76, 0]}><boxGeometry args={[1.92, 0.12, 1.3]} /><meshStandardMaterial color="#a9b3b8" metalness={0.85} roughness={0.28} /></mesh>
        <mesh position={[0, 0.2, 0.62]}><boxGeometry args={[0.75, 0.32, 0.06]} /><meshStandardMaterial color="#6cc7c8" emissive="#1b6f77" emissiveIntensity={2} /></mesh>
        <Pipe a={[-0.55, 1.1, -10.2]} b={[-0.55, 2.9, -10.2]} radius={0.11} />
        <Pipe a={[0.55, 1.1, -10.2]} b={[0.55, 2.9, -10.2]} radius={0.11} color="#87949a" />
      </group>
      <group position={[0, 4.8, -8.1]}>
        <mesh><boxGeometry args={[7.8, 0.12, 0.3]} /><meshStandardMaterial color="#3b4852" metalness={0.7} roughness={0.35} /></mesh>
        {[-2.8, -1.4, 0, 1.4, 2.8].map((x) => <mesh key={x} position={[x, -0.12, 0.08]}><boxGeometry args={[0.12, 0.28, 0.2]} /><meshStandardMaterial color="#7b8a91" metalness={0.7} /></mesh>)}
        <mesh position={[0, -0.16, 0.22]}><boxGeometry args={[3.8, 0.04, 0.05]} /><meshStandardMaterial color="#a8d9df" emissive="#438f9e" emissiveIntensity={3} /></mesh>
      </group>
      <mesh position={[2.6, 2.7, -12.82]}><boxGeometry args={[2.2, 1.3, 0.12]} /><meshStandardMaterial color="#1c2c38" metalness={0.45} roughness={0.4} /></mesh>
      <mesh position={[2.6, 2.7, -12.72]}><boxGeometry args={[1.85, 0.95, 0.035]} /><meshStandardMaterial color="#153f4b" emissive="#0b5965" emissiveIntensity={1.3} /></mesh>
      {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[1.95 + i * 0.31, 2.68 + Math.sin(i * 1.3) * 0.18, -12.68]}><boxGeometry args={[0.12, 0.36 + (i % 2) * 0.18, 0.025]} /><meshStandardMaterial color={i === 4 && alarmOn ? "#ff3131" : "#7dd0b9"} emissive={i === 4 && alarmOn ? "#ff0000" : "#185c50"} emissiveIntensity={2} /></mesh>)}

      {/* Exterior approach, hazard stripes, vents and surface details. */}
      <mesh position={[0, 0.02, 1.1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 8]} /><meshStandardMaterial color="#3a3c35" roughness={1} /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-4.4 + i * 1.1, 0.035, 1.1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.42, 0.1]} /><meshStandardMaterial color="#c69d50" roughness={0.8} /></mesh>)}
      {[-4.3, -3.5, 3.5, 4.3].map((x) => <group key={x} position={[x, 4.6, -3.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.28, 24]} /><meshStandardMaterial color="#38464f" metalness={0.8} roughness={0.32} /></mesh>
        {[-0.12, 0, 0.12].map((z) => <mesh key={z} position={[0, 0.2, z]}><boxGeometry args={[0.5, 0.045, 0.05]} /><meshStandardMaterial color="#a8b1b3" metalness={0.8} /></mesh>)}
      </group>)}

      {/* The owner of the bunker: vector stickman silhouette. */}
      <Stickman x={-2.7} z={1.9} scale={1.18} pose={f > 800 ? 1 : 0} />
      <Stickman x={-1.9} z={-1.8} scale={0.72} zombie pose={1} />
      <Stickman x={1.95} z={-1.6} scale={0.76} zombie pose={1} />
      {/* Shapes beyond the open door: one person at the gate, then a second moving shadow. */}
      <group position={[0, 0, -1.4]} visible={f > 690}>
        <Stickman x={0.1} z={0} scale={0.88} zombie={false} pose={1} />
        <mesh position={[0.65, 1.15, -0.12]} scale={[0.24, 0.7, 0.12]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#161b20" roughness={1} /></mesh>
      </group>
      <group position={[0, 0, -2.1]} visible={f > 830}>
        <Stickman x={1.45} z={0} scale={1.12} zombie pose={1} />
      </group>
      <pointLight position={[0.5, 1.4, -1.5]} color="#ff2525" intensity={tension * 2.4} distance={5} />
    </>
  );
};

const beats = [
  { a: 0, b: 104, text: "I spent my entire $1,000,000 on a zombie-proof bunker." },
  { a: 105, b: 225, text: "Six metres underground. Reinforced concrete. A four-tonne blast door." },
  { a: 226, b: 390, text: "Inside: twelve months of food, recycled water, power and medical supplies." },
  { a: 391, b: 555, text: "I thought I was ready. Then the motion sensors lit up." },
  { a: 556, b: 735, text: "Three survivors are outside. One is bleeding. One says they're infected." },
  { a: 736, b: 900, text: "The radio crackles: 'Open the door. Please. I'm not alone.'" },
  { a: 901, b: 1034, text: "But the camera shows only ONE person... and something moving behind them." },
  { a: 1035, b: 1199, text: "YOU DECIDE. Which risk would you take?" },
];

const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const beat = beats.find((b) => f >= b.a && f <= b.b) ?? beats[beats.length - 1];
  const alpha = clamp(Math.min(1, (f - beat.a) / 12, (beat.b - f) / 12), 0, 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "space-between", padding: "9% 7% 8%", color: "white", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.92 }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 4 }}>LAST SHELTER</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#f4c77d" }}>DAY 01 / 30</div>
      </div>
      <div style={{ marginTop: "auto", marginBottom: f >= 1035 ? "auto" : "8%", opacity: alpha, textAlign: "center", textShadow: "0 3px 14px rgba(0,0,0,.9)" }}>
        <div style={{ display: "inline-block", background: "rgba(7,13,22,.72)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 16, padding: "20px 24px", maxWidth: "100%" }}>
          <div style={{ fontSize: f < 105 ? 44 : 35, fontWeight: 900, lineHeight: 1.12 }}>{beat.text}</div>
        </div>
        {f >= 1035 && (
          <div style={{ display: "flex", gap: 18, marginTop: 28, textAlign: "left" }}>
            <div style={{ flex: 1, padding: "22px 18px", borderRadius: 16, background: "rgba(24,91,119,.94)", border: "2px solid #8de1f0" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#a9efff" }}>A — OPEN</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Risk the bunker. Rescue them.</div>
            </div>
            <div style={{ flex: 1, padding: "22px 18px", borderRadius: 16, background: "rgba(110,43,42,.94)", border: "2px solid #ff9a7b" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#ffc0a9" }}>B — SEAL</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Save yourself. Leave them outside.</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, fontWeight: 800, letterSpacing: 2, opacity: 0.85 }}>
        <span>COMMENT A OR B</span><span>PART 01</span>
      </div>
    </AbsoluteFill>
  );
};

export const BunkerSurvival: React.FC = () => {
  useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#111c2c" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ position: [8.5, 6.2, 14.5], fov: 39, near: 0.1, far: 100 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <BunkerWorld />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
