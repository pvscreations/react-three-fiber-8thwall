// GiftReveal.jsx
// npm i three @react-three/fiber @react-three/drei @react-three/postprocessing gsap
// Tailwind must be set up in your project (only used for the HTML overlay).

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  Sparkles,
  MeshReflectorMaterial,
  RoundedBox,
  Html,
  DragControls,
  PivotControls,
  TransformControls,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import gsap from "gsap";
import { Test } from "./Test";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const TICKET_W = 3.2;
const TICKET_H = 1.6;
const GOLD = new THREE.Color("#ffc94d");
const hot = (hex, k) => new THREE.Color(hex).multiplyScalar(k); // >1 = blooms

let _glow;
const glowTexture = () => {
  if (_glow) return _glow;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.25, "rgba(255,255,255,0.55)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
};

function makeTicketTexture(face) {
  const W = 1600;
  const H = 800;
  const pad = 10;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");

  const rr = (x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };

  g.save();
  rr(pad, pad, W - pad * 2, H - pad * 2, 52);
  g.clip();

  if (face === "front") {
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#1d0640");
    bg.addColorStop(0.55, "#5a1596");
    bg.addColorStop(1, "#d6195a");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    const rg = g.createRadialGradient(
      W * 0.28,
      H * 0.15,
      10,
      W * 0.28,
      H * 0.15,
      W * 0.7,
    );
    rg.addColorStop(0, "rgba(255,255,255,0.28)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, W, H);

    g.strokeStyle = "rgba(255,255,255,0.05)";
    g.lineWidth = 2;
    for (let i = -H; i < W; i += 26) {
      g.beginPath();
      g.moveTo(i, H);
      g.lineTo(i + H, 0);
      g.stroke();
    }

    // main
    g.textAlign = "left";
    g.fillStyle = "#ffd27a";
    g.font = '600 46px Georgia, "Times New Roman", serif';
    g.fillText("A gift, just for you", 100, 160);

    const gold = g.createLinearGradient(0, 190, 0, 470);
    gold.addColorStop(0, "#fff6d0");
    gold.addColorStop(0.5, "#ffd05a");
    gold.addColorStop(1, "#ff9d1f");
    g.fillStyle = gold;
    g.font = '900 300px Impact, "Arial Black", sans-serif';
    g.fillText("50%", 90, 450);
    g.font = '900 120px Impact, "Arial Black", sans-serif';
    g.fillText("OFF", 640, 450);

    g.fillStyle = "rgba(255,255,255,0.85)";
    g.font = '400 44px Georgia, "Times New Roman", serif';
    g.fillText("your next order, anything, anywhere", 100, 540);

    // code pill
    rr(100, 600, 560, 110, 55);
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fill();
    g.strokeStyle = "#ffd27a";
    g.lineWidth = 4;
    g.setLineDash([16, 10]);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#fff";
    g.font = '700 58px "Courier New", monospace';
    g.fillText("WOW-2026", 150, 678);

    // stub
    g.fillStyle = "rgba(0,0,0,0.22)";
    g.fillRect(1120, 0, W - 1120, H);
    g.save();
    g.translate(1250, H / 2);
    g.rotate(-Math.PI / 2);
    g.textAlign = "center";
    g.fillStyle = "#ffd27a";
    g.font = "700 52px Georgia, serif";
    g.fillText("ADMIT ONE WIN", 0, 0);
    g.restore();
    g.fillStyle = "#fff";
    let x = 1340;
    while (x < 1520) {
      const w = 4 + Math.floor(Math.random() * 3) * 4;
      g.fillRect(x, 180, w, 440);
      x += w + 7;
    }

    // perforation
    g.strokeStyle = "rgba(255,255,255,0.7)";
    g.lineWidth = 5;
    g.setLineDash([14, 16]);
    g.beginPath();
    g.moveTo(1120, 60);
    g.lineTo(1120, H - 60);
    g.stroke();
    g.setLineDash([]);
  } else {
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fff1b8");
    bg.addColorStop(0.5, "#f5a623");
    bg.addColorStop(1, "#a8610a");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(90,40,0,0.18)";
    g.lineWidth = 6;
    for (let i = 1; i < 9; i++) {
      g.beginPath();
      g.arc(W / 2, H / 2, i * 90, 0, Math.PI * 2);
      g.stroke();
    }
    g.textAlign = "center";
    g.fillStyle = "rgba(90,40,0,0.85)";
    g.font = '900 360px Impact, "Arial Black", sans-serif';
    g.fillText("WOW", W / 2, H / 2 + 125);
  }
  g.restore();

  // border
  g.strokeStyle = "#ffd27a";
  g.lineWidth = 6;
  g.setLineDash([22, 14]);
  rr(38, 38, W - 76, H - 76, 36);
  g.stroke();
  g.setLineDash([]);

  // notches
  g.globalCompositeOperation = "destination-out";
  const notch = (x, y, r) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  };
  g.fillStyle = "#000";
  notch(pad, H / 2, 46);
  notch(W - pad, H / 2, 46);
  if (face === "front") {
    notch(1120, pad, 34);
    notch(1120, H - pad, 34);
  }
  g.globalCompositeOperation = "source-over";

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const makeRayMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: hot("#ffcf7a", 2.2) },
      uOpacity: { value: 0 },
    },
    vertexShader: `varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uOpacity;
      void main(){
        float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float along = 1.0 - vUv.y;
        float a = pow(across, 1.6) * pow(along, 1.4) * uOpacity;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });

/* -------------------------------------------------------------------------- */
/*  Camera rig                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Desktop-only camera controller from the original GiftReveal demo.
 * It forces camera.position + lookAt every frame so the gift stays screen-center.
 * That FIGHTS XR8 SLAM (which also writes camera pose every frame).
 * Keep disabled while running inside XR — let XR8 own the camera.
 */
function Rig({ shake }) {
  const p = useRef({ x: 0, y: 0 });
  useFrame((state, dt) => {
    p.current.x = THREE.MathUtils.damp(p.current.x, state.pointer.x, 3, dt);
    p.current.y = THREE.MathUtils.damp(p.current.y, state.pointer.y, 3, dt);
    const asp = state.size.width / state.size.height;
    const z = 8.2 + Math.max(0, 1 - asp) * 5;
    const s = shake.amt;
    state.camera.position.set(
      p.current.x * 0.6 + (Math.random() - 0.5) * s,
      3.4 + p.current.y * 0.3 + (Math.random() - 0.5) * s,
      z + (Math.random() - 0.5) * s * 0.5,
    );
    state.camera.lookAt(0, 1, 0);
  });
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Gift box                                                                  */
/* -------------------------------------------------------------------------- */

const boxMat = {
  color: "#e0125f",
  roughness: 0.28,
  metalness: 0.15,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
};
const goldMat = {
  color: "#ffc94d",
  metalness: 1,
  roughness: 0.22,
  envMapIntensity: 1.6,
};

function Gift({ giftRef, lidRef, interiorRef, onOpen, onHover }) {
  const interiorColor = useMemo(() => hot("#ffcf6b", 3), []);
  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log("coming");
  //     onOpen();
  //     onHover();
  //   }, 6000);
  // }, []);
  return (
    <group
      ref={giftRef}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      {/* body */}
      <RoundedBox
        args={[1.4, 1.1, 1.4]}
        radius={0.05}
        smoothness={4}
        position={[0, 0.55, 0]}
      >
        <meshPhysicalMaterial {...boxMat} />
      </RoundedBox>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.28, 1.1, 1.42]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.42, 1.098, 0.28]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>

      {/* what's inside */}
      <mesh
        ref={interiorRef}
        position={[0, 1.104, 0]}
        rotation-x={-Math.PI / 2}
        scale={0.001}
      >
        <planeGeometry args={[1.3, 1.3]} />
        <meshBasicMaterial
          map={glowTexture()}
          color={interiorColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* lid + bow */}
      <group ref={lidRef} position={[0, 1.1, 0]}>
        <RoundedBox
          args={[1.52, 0.3, 1.52]}
          radius={0.04}
          smoothness={4}
          position={[0, 0.15, 0]}
        >
          <meshPhysicalMaterial {...boxMat} />
        </RoundedBox>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.28, 0.302, 1.54]} />
          <meshStandardMaterial {...goldMat} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.54, 0.298, 0.28]} />
          <meshStandardMaterial {...goldMat} />
        </mesh>
        <group position={[0, 0.3, 0]}>
          <mesh
            position={[-0.27, 0.2, 0]}
            rotation={[0, 0.4, 0.55]}
            scale={[1.25, 1, 1]}
          >
            <torusGeometry args={[0.2, 0.07, 16, 40]} />
            <meshStandardMaterial {...goldMat} />
          </mesh>
          <mesh
            position={[0.27, 0.2, 0]}
            rotation={[0, -0.4, -0.55]}
            scale={[1.25, 1, 1]}
          >
            <torusGeometry args={[0.2, 0.07, 16, 40]} />
            <meshStandardMaterial {...goldMat} />
          </mesh>
          <mesh position={[-0.1, 0.02, 0.08]} rotation={[0.2, 0, 0.5]}>
            <boxGeometry args={[0.13, 0.45, 0.03]} />
            <meshStandardMaterial {...goldMat} />
          </mesh>
          <mesh position={[0.1, 0.02, 0.08]} rotation={[0.2, 0, -0.5]}>
            <boxGeometry args={[0.13, 0.45, 0.03]} />
            <meshStandardMaterial {...goldMat} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial {...goldMat} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  God rays                                                                  */
/* -------------------------------------------------------------------------- */

function Rays({ groupRef, material }) {
  const rays = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        yaw: (i / 18) * Math.PI * 2 + Math.random() * 0.3,
        tilt: (Math.random() - 0.5) * 1.3,
        w: 0.35 + Math.random() * 1.1,
        len: 6 + Math.random() * 4,
      })),
    [],
  );
  useFrame((s, dt) => {
    if (groupRef.current?.visible) groupRef.current.rotation.y += dt * 0.12;
  });
  return (
    <group ref={groupRef} position={[0, 1.15, 0]} visible={false}>
      {rays.map((r, i) => (
        <group key={i} rotation={[0, r.yaw, r.tilt]}>
          <mesh position-y={r.len / 2} material={material}>
            <planeGeometry args={[r.w, r.len]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Flare burst (additive point sprites)                                      */
/* -------------------------------------------------------------------------- */

const PALETTE = [
  [3, 2.2, 0.6],
  [3, 0.7, 1.6],
  [0.6, 2.2, 3],
  [3, 3, 3],
  [2.2, 1.2, 3],
];

const Burst = forwardRef(function Burst(_, ref) {
  const N = 650;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(N * 3), 3),
    );
    g.setAttribute(
      "aColor",
      new THREE.BufferAttribute(new Float32Array(N * 3), 3),
    );
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(N), 1));
    return g;
  }, []);
  const d = useMemo(
    () => ({
      vel: new Float32Array(N * 3),
      life: new Float32Array(N),
      max: new Float32Array(N).fill(1),
      base: new Float32Array(N),
      col: new Float32Array(N * 3),
    }),
    [],
  );
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uScale: { value: 500 } },
        vertexShader: `attribute float aSize; attribute vec3 aColor; varying vec3 vColor; uniform float uScale;
          void main(){
            vColor = aColor;
            vec4 mv = modelViewMatrix * vec4(position,1.0);
            gl_PointSize = aSize * uScale / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `varying vec3 vColor;
          void main(){
            float dd = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, dd);
            float core = smoothstep(0.16, 0.0, dd);
            gl_FragColor = vec4(vColor * (a * a + core * 1.2), 1.0);
          }`,
      }),
    [],
  );

  useImperativeHandle(ref, () => ({
    fire(o) {
      const pos = geo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        pos[i * 3] = o.x + (Math.random() - 0.5) * 0.5;
        pos[i * 3 + 1] = o.y;
        pos[i * 3 + 2] = o.z + (Math.random() - 0.5) * 0.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(1 - Math.random() * 0.97);
        const speed = 2 + Math.pow(Math.random(), 2) * 9;
        d.vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
        d.vel[i * 3 + 1] = Math.cos(phi) * speed * 1.1 + 1;
        d.vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
        d.max[i] = d.life[i] = 1.3 + Math.random() * 2.2;
        d.base[i] = Math.random() < 0.08 ? 0.8 : 0.1 + Math.random() * 0.35;
        const c = PALETTE[(Math.random() * PALETTE.length) | 0];
        d.col[i * 3] = c[0];
        d.col[i * 3 + 1] = c[1];
        d.col[i * 3 + 2] = c[2];
      }
    },
  }));

  useFrame((state, dt) => {
    mat.uniforms.uScale.value =
      (state.size.height * state.viewport.dpr) /
      (2 * Math.tan(THREE.MathUtils.degToRad(state.camera.fov / 2)));
    const pos = geo.attributes.position.array;
    const col = geo.attributes.aColor.array;
    const size = geo.attributes.aSize.array;
    const t = state.clock.elapsedTime;
    const g = Math.min(dt, 0.033);
    for (let i = 0; i < N; i++) {
      if (d.life[i] <= 0) {
        size[i] = 0;
        continue;
      }
      d.life[i] -= g;
      const k = 1 - 1.1 * g;
      d.vel[i * 3] *= k;
      d.vel[i * 3 + 1] = d.vel[i * 3 + 1] * k - 2.4 * g;
      d.vel[i * 3 + 2] *= k;
      pos[i * 3] += d.vel[i * 3] * g;
      pos[i * 3 + 1] += d.vel[i * 3 + 1] * g;
      pos[i * 3 + 2] += d.vel[i * 3 + 2] * g;
      if (pos[i * 3 + 1] < 0.03) {
        pos[i * 3 + 1] = 0.03;
        d.vel[i * 3 + 1] *= -0.3;
      }
      const f = Math.max(d.life[i] / d.max[i], 0);
      const b = Math.pow(f, 1.4) * (0.75 + 0.25 * Math.sin(t * 22 + i));
      col[i * 3] = d.col[i * 3] * b;
      col[i * 3 + 1] = d.col[i * 3 + 1] * b;
      col[i * 3 + 2] = d.col[i * 3 + 2] * b;
      size[i] = d.base[i] * (0.35 + 0.65 * f);
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aColor.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
});

/* -------------------------------------------------------------------------- */
/*  Confetti                                                                  */
/* -------------------------------------------------------------------------- */

const Confetti = forwardRef(function Confetti(_, ref) {
  const N = 180;
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const d = useMemo(
    () => ({
      p: new Float32Array(N * 3),
      v: new Float32Array(N * 3),
      r: new Float32Array(N * 3),
      rv: new Float32Array(N * 3),
      s: new Float32Array(N),
      on: new Uint8Array(N),
      active: false,
    }),
    [],
  );

  useLayoutEffect(() => {
    const m = mesh.current;
    const pal = [
      "#ffd27a",
      "#ff4fa3",
      "#58d6ff",
      "#b58cff",
      "#ffffff",
      "#7dffb2",
    ].map((c) => new THREE.Color(c));
    for (let i = 0; i < N; i++) {
      m.setColorAt(i, pal[i % pal.length]);
      dummy.position.set(0, -10, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.instanceColor.needsUpdate = true;
  }, [dummy]);

  useImperativeHandle(ref, () => ({
    fire(o) {
      for (let i = 0; i < N; i++) {
        d.p[i * 3] = o.x + (Math.random() - 0.5) * 0.6;
        d.p[i * 3 + 1] = o.y;
        d.p[i * 3 + 2] = o.z + (Math.random() - 0.5) * 0.6;
        const th = Math.random() * Math.PI * 2;
        const h = 0.8 + Math.random() * 3.6;
        d.v[i * 3] = Math.cos(th) * h;
        d.v[i * 3 + 1] = 5 + Math.random() * 7;
        d.v[i * 3 + 2] = Math.sin(th) * h;
        for (let k = 0; k < 3; k++) {
          d.r[i * 3 + k] = Math.random() * 6;
          d.rv[i * 3 + k] = (Math.random() - 0.5) * 14;
        }
        d.s[i] = 0.7 + Math.random() * 0.9;
        d.on[i] = 1;
      }
      d.active = true;
    },
  }));

  useFrame((state, dt) => {
    if (!d.active) return;
    const g = Math.min(dt, 0.033);
    const t = state.clock.elapsedTime;
    let alive = 0;
    for (let i = 0; i < N; i++) {
      if (d.on[i] !== 1) continue;
      alive++;
      d.v[i * 3 + 1] = Math.max(d.v[i * 3 + 1] - 9 * g, -2);
      d.v[i * 3] *= 1 - 0.8 * g;
      d.v[i * 3 + 2] *= 1 - 0.8 * g;
      d.p[i * 3] += (d.v[i * 3] + Math.sin(t * 3 + i) * 0.4) * g;
      d.p[i * 3 + 1] += d.v[i * 3 + 1] * g;
      d.p[i * 3 + 2] += d.v[i * 3 + 2] * g;
      for (let k = 0; k < 3; k++) d.r[i * 3 + k] += d.rv[i * 3 + k] * g;
      if (d.p[i * 3 + 1] <= 0.012) {
        d.p[i * 3 + 1] = 0.012;
        d.r[i * 3] = -Math.PI / 2;
        d.r[i * 3 + 1] = 0;
        d.on[i] = 2;
      }
      dummy.position.set(d.p[i * 3], d.p[i * 3 + 1], d.p[i * 3 + 2]);
      dummy.rotation.set(d.r[i * 3], d.r[i * 3 + 1], d.r[i * 3 + 2]);
      dummy.scale.setScalar(d.s[i]);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (!alive) d.active = false;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, N]} frustumCulled={false}>
      <planeGeometry args={[0.16, 0.09]} />
      <meshStandardMaterial
        side={THREE.DoubleSide}
        metalness={0.7}
        roughness={0.3}
        envMapIntensity={1.6}
      />
    </instancedMesh>
  );
});

/* -------------------------------------------------------------------------- */
/*  Coupon ticket                                                             */
/* -------------------------------------------------------------------------- */

function Ticket({ groupRef, spinRef, fly }) {
  const tiltRef = useRef();
  const roll = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const parentWorldQuat = useMemo(() => new THREE.Quaternion(), []);
  const glow = glowTexture();
  const haloColor = useMemo(() => hot("#ffb347", 1.4), []);
  const [front, back] = useMemo(
    () => [makeTicketTexture("front"), makeTicketTexture("back")],
    [],
  );
  const shimmer = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uMap: { value: front }, uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform sampler2D uMap; uniform float uTime; varying vec2 vUv;
          void main(){
            float a = texture2D(uMap, vUv).a;
            float x = vUv.x + vUv.y * 0.4;
            float s = fract(uTime * 0.3) * 2.2 - 0.5;
            float band = smoothstep(0.1, 0.0, abs(x - s));
            gl_FragColor = vec4(vec3(1.0, 0.92, 0.75) * band * 0.7 * a, 1.0);
          }`,
      }),
    [front],
  );

  useFrame((state, dt) => {
    shimmer.uniforms.uTime.value = state.clock.elapsedTime;
    const g = groupRef.current;
    if (!g || fly.p <= 0) return;
    const cam = state.camera;
    const p = fly.p;
    const dist = 1.2; // closer in AR — phone FOV / world units differ from desktop

    // XR8 leaves camera.fov stale; derive vertical FOV from projectionMatrix
    // const dist = 3.2;
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist;
    const aspect = state.size.width / state.size.height;
    const portrait = aspect < 1;
    const onW = portrait ? TICKET_H : TICKET_W;
    const onH = portrait ? TICKET_W : TICKET_H;
    const fit = Math.min((vh * aspect * 0.9) / onW, (vh * 0.86) / onH);

    // World-space point in front of the XR camera...
    tmp.set(0, 0, -dist).applyQuaternion(cam.quaternion).add(cam.position);
    // ...converted into this group's parent space (needed when Scene is at z=-8)
    if (g.parent) g.parent.worldToLocal(tmp);

    g.position.lerpVectors(fly.start.pos, tmp, p);
    g.position.y += Math.sin(p * Math.PI) * 0.5;
    g.scale.setScalar(THREE.MathUtils.lerp(fly.start.scale, fit, p));
    g.quaternion.slerpQuaternions(fly.start.quat, cam.quaternion, p);
    roll.current = THREE.MathUtils.damp(
      roll.current,
      portrait ? Math.PI / 2 : 0,
      4,
      dt,
    );
    const bob = Math.sin(state.clock.elapsedTime * 1.4) * 0.02;
    tiltRef.current.rotation.set(
      -state.pointer.y * 0.14 * p + bob,
      state.pointer.x * 0.2 * p,
      roll.current * p,
    );
  });

  return (
    <group ref={groupRef} visible={false}>
      <group ref={tiltRef}>
        <sprite position-z={-0.06} scale={[TICKET_W * 1.9, TICKET_H * 2.7, 1]}>
          <spriteMaterial
            map={glow}
            color={haloColor}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            fog={false}
          />
        </sprite>
        <group ref={spinRef}>
          <mesh>
            <planeGeometry args={[TICKET_W, TICKET_H]} />
            <meshBasicMaterial
              map={front}
              transparent
              alphaTest={0.01}
              toneMapped={false}
              fog={false}
            />
          </mesh>
          <mesh position-z={0.004}>
            <planeGeometry args={[TICKET_W, TICKET_H]} />
            <primitive object={shimmer} attach="material" />
          </mesh>
          <mesh rotation-y={Math.PI} position-z={-0.004}>
            <planeGeometry args={[TICKET_W, TICKET_H]} />
            <meshBasicMaterial
              map={back}
              transparent
              alphaTest={0.01}
              toneMapped={false}
              fog={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene: the choreography                                                   */
/* -------------------------------------------------------------------------- */

function Scene({ onPhase }) {
  const gift = useRef();
  const lid = useRef();
  const interior = useRef();
  const rays = useRef();
  const pool = useRef();
  const ring = useRef();
  const light = useRef();
  const flash = useRef();
  const streak = useRef();
  const ticket = useRef();
  const spin = useRef();
  const burst = useRef();
  const confetti = useRef();
  const phase = useRef("falling");
  const idle = useRef();
  const ctx = useRef();
  const [bang, setBang] = useState(false);

  const glow = glowTexture();
  const shake = useMemo(() => ({ amt: 0 }), []);
  const rayMat = useMemo(makeRayMaterial, []);
  const fly = useMemo(
    () => ({
      p: 0,
      start: {
        pos: new THREE.Vector3(),
        quat: new THREE.Quaternion(),
        scale: 1,
      },
    }),
    [],
  );
  const flashColor = useMemo(() => hot("#ffe2a8", 4), []);
  const ringColor = useMemo(() => hot("#ffcf7a", 2.5), []);

  const pulseRing = (size, opacity) => {
    gsap.fromTo(
      ring.current.scale,
      { x: 0.6, y: 0.6, z: 0.6 },
      { x: size, y: size, z: size, duration: 1.1, ease: "power3.out" },
    );
    gsap.fromTo(
      ring.current.material,
      { opacity },
      { opacity: 0, duration: 1.1, ease: "power2.out" },
    );
  };

  /* --- 1. the fall ------------------------------------------------------- */
  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {
      const g = gift.current;
      g.position.set(0, 9, 0);
      g.rotation.set(0.9, 0.4, -0.5);
      lid.current.rotation.set(0, 0, 0);

      const impact = (big) => {
        shake.amt = big ? 0.35 : 0.1;
        gsap.to(shake, { amt: 0, duration: 0.5, ease: "power2.out" });
        pulseRing(big ? 4.5 : 2.5, big ? 0.7 : 0.35);
        gsap.fromTo(
          pool.current.material,
          { opacity: 0.8 },
          { opacity: 0.3, duration: 0.8 },
        );
      };

      gsap
        .timeline({
          delay: 0.7,
          onComplete: () => {
            phase.current = "idle";
            onPhase("idle");
            gsap.to(light.current, { intensity: 6, duration: 1 });
            gsap.to(pool.current.material, {
              opacity: 0.65,
              duration: 1.3,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
            });
            idle.current = gsap
              .timeline({ repeat: -1, repeatDelay: 2.4 })
              .to(g.rotation, {
                z: 0.06,
                duration: 0.08,
                yoyo: true,
                repeat: 5,
                ease: "sine.inOut",
              })
              .to(g.rotation, { z: 0, duration: 0.1 });
          },
        })
        .to(g.position, { y: 0, duration: 1, ease: "power2.in" }, 0)
        .to(
          g.rotation,
          { x: 0, z: 0, y: 0.35, duration: 1, ease: "power2.in" },
          0,
        )
        .call(() => impact(true), null, 1)
        .to(
          g.scale,
          { x: 1.2, y: 0.75, z: 1.2, duration: 0.08, ease: "power2.out" },
          1,
        )
        .to(
          g.scale,
          { x: 1, y: 1, z: 1, duration: 0.7, ease: "elastic.out(1,0.3)" },
          1.08,
        )
        .to(g.position, { y: 0.55, duration: 0.25, ease: "power2.out" }, 1.05)
        .to(g.position, { y: 0, duration: 0.25, ease: "power2.in" }, 1.3)
        .call(() => impact(false), null, 1.55);
    });
    return () => {
      document.body.style.cursor = "auto";
      ctx.current.revert();
    };
    // eslint-disable-next-line
  }, []);

  /* --- 2. hover ---------------------------------------------------------- */
  const hover = (on) => {
    if (phase.current !== "idle") return;
    document.body.style.cursor = on ? "pointer" : "auto";
    gsap.to(gift.current.scale, {
      x: on ? 1.07 : 1,
      y: on ? 1.07 : 1,
      z: on ? 1.07 : 1,
      duration: 0.3,
      overwrite: "auto",
    });
  };

  /* --- 3. the opening ---------------------------------------------------- */
  const open = () => {
    if (phase.current !== "idle") return;
    phase.current = "opening";
    onPhase("opening");
    document.body.style.cursor = "auto";

    ctx.current.add(() => {
      const g = gift.current;
      const t = ticket.current;
      idle.current?.kill();
      gsap.killTweensOf([g.rotation, g.scale, pool.current.material]);
      g.rotation.z = 0;

      const tl = gsap.timeline({
        onComplete: () => {
          phase.current = "opened";
          onPhase("opened");
        },
      });

      // anticipation: the box trembles and swells
      tl.to(
        g.rotation,
        { z: 0.05, duration: 0.05, yoyo: true, repeat: 9, ease: "none" },
        0,
      )
        .to(
          g.scale,
          { x: 1.14, y: 0.92, z: 1.14, duration: 0.5, ease: "power2.in" },
          0,
        )
        .to(
          light.current,
          { intensity: 30, duration: 0.5, ease: "power2.in" },
          0,
        )

        // BOOM
        .addLabel("boom", 0.5)
        .call(
          () => {
            burst.current.fire(new THREE.Vector3(0, 1.2, 0));
            confetti.current.fire(new THREE.Vector3(0, 1.3, 0));
            setBang(true);
            rays.current.visible = true;
            shake.amt = 0.6;
            pulseRing(7.5, 1);
          },
          null,
          "boom",
        )
        .to(shake, { amt: 0, duration: 0.9, ease: "power2.out" }, "boom")
        .to(
          g.scale,
          { x: 1, y: 1, z: 1, duration: 0.7, ease: "elastic.out(1,0.35)" },
          "boom",
        )
        // lid
        .to(
          lid.current.position,
          { x: 1.8, y: 6, z: -1.2, duration: 1.1, ease: "power3.out" },
          "boom",
        )
        .to(
          lid.current.rotation,
          { x: 2.4, y: 1, z: -1.6, duration: 1.1, ease: "power2.out" },
          "boom",
        )
        .to(
          lid.current.scale,
          { x: 0.001, y: 0.001, z: 0.001, duration: 0.4, ease: "power2.in" },
          "boom+=0.8",
        )
        // glow from inside
        .to(
          interior.current.scale,
          { x: 1, y: 1, z: 1, duration: 0.5, ease: "expo.out" },
          "boom",
        )
        .to(interior.current.material, { opacity: 1, duration: 0.3 }, "boom")
        .fromTo(
          light.current,
          { intensity: 200 },
          { intensity: 14, duration: 1.6, ease: "power3.out" },
          "boom",
        )
        // lens flash + anamorphic streak
        .fromTo(
          flash.current.scale,
          { x: 0.1, y: 0.1 },
          { x: 14, y: 14, duration: 0.7, ease: "expo.out" },
          "boom",
        )
        .fromTo(
          flash.current.material,
          { opacity: 1 },
          { opacity: 0, duration: 0.9, ease: "power2.out" },
          "boom",
        )
        .fromTo(
          streak.current.scale,
          { x: 0.1, y: 0.35 },
          { x: 22, y: 0.35, duration: 0.8, ease: "expo.out" },
          "boom",
        )
        .fromTo(
          streak.current.material,
          { opacity: 1 },
          { opacity: 0, duration: 1.1, ease: "power2.out" },
          "boom",
        )
        // god rays
        .fromTo(
          rays.current.scale,
          { y: 0.01 },
          { y: 1, duration: 1.1, ease: "expo.out" },
          "boom",
        )
        .to(
          rayMat.uniforms.uOpacity,
          { value: 0.5, duration: 0.5, ease: "power2.out" },
          "boom",
        )
        .to(
          rayMat.uniforms.uOpacity,
          { value: 0.28, duration: 2, ease: "sine.inOut" },
          "boom+=1.5",
        )
        // floor glow
        .to(
          pool.current.scale,
          { x: 3, y: 3, z: 3, duration: 1.2, ease: "power3.out" },
          "boom",
        )
        .to(pool.current.material, { opacity: 0.9, duration: 0.4 }, "boom")
        .to(
          pool.current.material,
          { opacity: 0.45, duration: 1.5 },
          "boom+=0.4",
        )

        // the ticket rises, spinning...
        .call(
          () => {
            t.visible = true;
            t.position.set(0, 1.1, 0);
            t.scale.setScalar(0.05);
            t.quaternion.identity();
          },
          null,
          "boom+=0.15",
        )
        .to(
          t.position,
          { y: 3.1, duration: 1.2, ease: "power3.out" },
          "boom+=0.15",
        )
        .to(
          t.scale,
          { x: 0.9, y: 0.9, z: 0.9, duration: 1.2, ease: "power3.out" },
          "boom+=0.15",
        )
        .to(
          spin.current.rotation,
          { y: Math.PI * 6, duration: 3.1, ease: "power2.inOut" },
          "boom+=0.15",
        )

        // ...then flies to the camera and fits the screen
        .addLabel("fly", "boom+=1.7")
        .call(
          () => {
            fly.start.pos.copy(t.position);
            fly.start.scale = t.scale.x;
            fly.start.quat.copy(t.quaternion);
          },
          null,
          "fly",
        )
        .to(fly, { p: 1, duration: 1.5, ease: "power3.inOut" }, "fly");
    });
  };

  return (
    <>
      {/* <color attach="background" args={["#06030c"]} />
      <fog attach="fog" args={["#06030c", 9, 24]} /> */}
      {/* XR: do NOT mount Rig — it overwrites XR8's SLAM camera every frame */}
      {/* <Rig shake={shake} /> */}

      <ambientLight intensity={0.15} />
      <spotLight
        position={[0, 8, 3]}
        angle={0.5}
        penumbra={1}
        intensity={90}
        color="#ffe2b8"
      />
      <pointLight
        ref={light}
        position={[0, 1.5, 0]}
        color="#ffb347"
        intensity={0}
        distance={14}
        decay={2}
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={4}
          color="#ffb36b"
          position={[-5, 4, 2]}
          scale={[6, 6, 1]}
          onUpdate={(s) => s.lookAt(0, 0, 0)}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#6b7bff"
          position={[5, 3, -3]}
          scale={[6, 4, 1]}
          onUpdate={(s) => s.lookAt(0, 0, 0)}
        />
        <Lightformer
          form="ring"
          intensity={2.5}
          color="#ff4fa3"
          position={[0, 6, 0]}
          scale={4}
          onUpdate={(s) => s.lookAt(0, 0, 0)}
        />
      </Environment>

      {/* floor on the xz plane */}
      {/* <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={35}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0b0614"
          metalness={0.5}
        />
      </mesh> */}
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.75}
        scale={10}
        blur={2.4}
        far={3}
        color="#000"
      />

      {/* glow pool + shockwave ring */}
      <mesh ref={pool} rotation-x={-Math.PI / 2} position-y={0.02}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial
          map={glow}
          color={GOLD}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.03}>
        <ringGeometry args={[0.95, 1, 96]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <Gift
        giftRef={gift}
        lidRef={lid}
        interiorRef={interior}
        onOpen={open}
        onHover={hover}
      />
      <Rays groupRef={rays} material={rayMat} />
      <Burst ref={burst} />
      <Confetti ref={confetti} />

      {/* flash + anamorphic streak */}
      <sprite
        ref={flash}
        position={[0, 1.3, 0]}
        scale={[0.1, 0.1, 1]}
        renderOrder={10}
      >
        <spriteMaterial
          map={glow}
          color={flashColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>
      <sprite
        ref={streak}
        position={[0, 1.3, 0]}
        scale={[0.1, 0.35, 1]}
        renderOrder={10}
      >
        <spriteMaterial
          map={glow}
          color={flashColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>

      {/* fireflies */}
      <Sparkles
        count={70}
        scale={[10, 4, 7]}
        position={[0, 2, 0]}
        size={4}
        speed={0.3}
        color="#ffd27a"
        opacity={0.8}
      />
      {bang && (
        <Sparkles
          count={140}
          scale={[6, 6, 6]}
          position={[0, 2.5, 0]}
          size={8}
          speed={1.2}
          color="#ff9ae0"
        />
      )}

      <Ticket groupRef={ticket} spinRef={spin} fly={fly} />

      {/* <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.4}
          mipmapBlur
          radius={0.8}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer> */}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  App (Tailwind overlay)                                                    */
/* -------------------------------------------------------------------------- */

export default function Experience() {
  const portal = useRef<HTMLElement>(document.body);
  // const [run, setRun] = useState(0);
  const [phase, setPhase] = useState("falling");

  const replay = () => {
    setPhase("falling");
    // setRun((r) => r + 1);
  };

  return (
    <>
      {/* <Canvas
        // key={run}
        dpr={[1, 1.75]}
        camera={{ position: [0, 3.4, 8.2], fov: 42, near: 0.1, far: 60 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      > */}

      <group position-z={-8}>
        {/* <Scene onPhase={setPhase} /> */}
        <TransformControls>
          <>
            <mesh>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial color="red" />
            </mesh>
            <Html portal={portal}>
              <div>
                <h1 style={{ color: "white" }}>hello</h1>
              </div>
            </Html>
          </>
        </TransformControls>
      </group>

      {/* </Canvas> */}
    </>
  );
}
