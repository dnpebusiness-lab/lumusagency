"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
  Infrared energy field.
  A single full-screen shader plane: a dark room with a slow, breathing
  warm heat source and drifting haze. No objects, no particles to count,
  no spinning. Cursor nudges the core. Cheap to render.
*/

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;

  // hash + value noise -> fbm for haze
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5);
    p.x *= aspect;

    // heat source position: off-centre, drifts with breath + cursor
    vec2 src = vec2(0.18, 0.06);
    src += 0.05 * vec2(sin(uTime*0.18), cos(uTime*0.13));
    src += uMouse * 0.10;

    float d = length(p - src);

    // breathing intensity
    float breath = 0.85 + 0.15 * sin(uTime * 0.5);

    // core falloff (infrared bloom)
    float core = breath * (0.10 / (d*d + 0.02));
    core = pow(core, 1.15);

    // drifting haze modulates the field
    float h = fbm(p * 2.6 + vec2(uTime*0.06, -uTime*0.04));
    float h2 = fbm(p * 5.0 - vec2(uTime*0.03, uTime*0.05));
    float haze = mix(h, h2, 0.5);

    float intensity = core * (0.55 + 0.6 * haze);

    // infrared colour ramp: deep red -> burnt orange -> amber
    vec3 deep = vec3(0.05, 0.012, 0.008);
    vec3 red  = vec3(1.0, 0.23, 0.12);
    vec3 orng = vec3(1.0, 0.42, 0.17);
    vec3 amb  = vec3(1.0, 0.69, 0.40);

    vec3 col = deep;
    col = mix(col, red,  smoothstep(0.0, 0.6, intensity));
    col = mix(col, orng, smoothstep(0.5, 1.2, intensity));
    col = mix(col, amb,  smoothstep(1.4, 2.6, intensity));

    // subtle horizontal scan banding for "screen / heat element" feel
    col += 0.015 * sin(uv.y * uRes.y * 0.7) * vec3(1.0, 0.4, 0.2);

    // vignette toward warm black
    float vig = smoothstep(1.25, 0.2, length(p));
    col *= vig;

    // keep base of the room near-black
    col = max(col, deep * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Field({ paused }: { paused: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size, pointer } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((_, delta) => {
    if (paused || !mat.current) return;
    const u = mat.current.uniforms;
    u.uTime.value += Math.min(delta, 0.05);
    u.uRes.value.set(size.width, size.height);
    // smooth the pointer
    mouse.current.lerp(pointer, 0.04);
    u.uMouse.value.copy(mouse.current);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function InfraredCore({ paused = false }: { paused?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: false, powerPreference: "low-power", alpha: false }}
      camera={{ position: [0, 0, 1] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Field paused={paused} />
    </Canvas>
  );
}
