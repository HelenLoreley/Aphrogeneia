import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType, SHAPE_Duration } from '../types';

// Bypass missing JSX types
const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const ShaderMaterial = 'shaderMaterial' as any;

const vertexShader = `
uniform float uTime;
uniform float uMix;
uniform vec2 uMouse;
uniform float uResolution;

attribute vec3 aTarget;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;

// Simplex 3D Noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ ); 
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  // Interpolate position
  vec3 pos = mix(position, aTarget, uMix);
  
  // Add noise breathing (Deep Sea / Universe Tide)
  float noiseVal = snoise(pos * 0.3 + uTime * 0.1);
  pos.z += noiseVal * 0.8;

  // Mouse Interaction (Fluid)
  vec3 mousePos = vec3(uMouse.x * 12.0, uMouse.y * 12.0, 0.0);
  float dist = distance(pos.xy, mousePos.xy);
  float influenceRadius = 7.0;
  
  // Interaction Logic: Fluid Repulsion & Wake
  if (dist < influenceRadius) {
    float force = (1.0 - dist / influenceRadius);
    force = smoothstep(0.0, 1.0, force); // Smooth falloff
    
    vec3 dir = normalize(pos - mousePos);
    
    // Gentle push away, like water parting
    pos += dir * force * 1.2; 
    
    // Vortex curl
    float angle = force * 1.5;
    float s = sin(angle);
    float c = cos(angle);
    float tx = pos.x;
    pos.x = tx * c - pos.y * s;
    pos.y = tx * s + pos.y * c;

    // Z-wave
    pos.z += force * 1.5 * sin(uTime * 2.0 - dist);
  }

  // Size calculation
  float finalSize = aSize;
  
  // Base Color: Deep Void / Ethereal Fluid
  // Mixing very dark blue/black with faint nebula purple
  vec3 colorDeep = vec3(0.01, 0.02, 0.08); // Almost black/blue
  vec3 colorMist = vec3(0.15, 0.12, 0.25); // Faint purple mist
  
  vColor = mix(colorDeep, colorMist, noiseVal * 0.5 + 0.5);

  if (dist < 4.0) {
    // Interaction Highlight: Subtle Bioluminescent Cyan/Mint
    float highlight = (1.0 - dist / 4.0);
    finalSize *= (1.0 + highlight * 0.3); // Slight size increase
    
    // Mix towards a mysterious deep teal/cyan
    vec3 fluidGlow = vec3(0.0, 0.3, 0.35); 
    vColor = mix(vColor, fluidGlow, highlight * 0.6);
  } 

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Distance attenuation
  gl_PointSize = finalSize * (250.0 / -mvPosition.z);
  
  // Ghostly alpha
  vAlpha = 0.3 + noiseVal * 0.2; 
}
`;

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Soft Cloud-like particle
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  // Very soft glow gradient
  float glow = 1.0 - (dist * 2.0);
  glow = pow(glow, 2.0); 

  gl_FragColor = vec4(vColor, vAlpha * glow);
}
`;

interface VortexProps {
  count?: number;
  mouseRef: React.MutableRefObject<[number, number]>;
}

export const MathVortex: React.FC<VortexProps> = ({ count = 30000, mouseRef }) => {
  const meshRef = useRef<THREE.Points>(null);
  const uniforms = useRef({
    uTime: { value: 0 },
    uMix: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: 1.0 }
  });

  const generateShape = (type: ShapeType, i: number, total: number): THREE.Vector3 => {
    const p = i / total;
    const theta = p * Math.PI * 20; // Multiple loops
    
    let x = 0, y = 0, z = (Math.random() - 0.5) * 5;

    switch (type) {
      case ShapeType.NEBULA:
        x = (Math.random() - 0.5) * 15;
        y = (Math.random() - 0.5) * 15;
        z = (Math.random() - 0.5) * 15;
        break;
      case ShapeType.ROSE:
        // k = 4 for 8 petals
        const rRose = 5 * Math.cos(4 * theta);
        x = rRose * Math.cos(theta);
        y = rRose * Math.sin(theta);
        break;
      case ShapeType.SPIRAL:
        const rSpiral = 0.5 * theta;
        x = rSpiral * Math.cos(theta) * 0.2;
        y = rSpiral * Math.sin(theta) * 0.2;
        z += (Math.random() - 0.5) * 2;
        break;
      case ShapeType.BUTTERFLY:
        const rButt = Math.exp(Math.cos(theta)) - 2 * Math.cos(4*theta) - Math.pow(Math.sin(theta/12), 5);
        x = rButt * Math.cos(theta) * 2.5;
        y = rButt * Math.sin(theta) * 2.5;
        break;
      case ShapeType.LEMNISCATE:
        const scale = 5;
        const t = theta;
        const den = 1 + Math.sin(t)*Math.sin(t);
        x = scale * Math.cos(t) / den;
        y = scale * Math.sin(t) * Math.cos(t) / den;
        break;
      default:
        x = (Math.random() - 0.5) * 10;
        y = (Math.random() - 0.5) * 10;
    }
    return new THREE.Vector3(x, y, z);
  };

  const { positions, attributes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3); 
    const sizes = new Float32Array(count);

    // Initial shape
    for (let i = 0; i < count; i++) {
      const v = generateShape(ShapeType.NEBULA, i, count);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
      sizes[i] = Math.random() * 2.0 + 0.5;
      
      target[i * 3] = v.x;
      target[i * 3 + 1] = v.y;
      target[i * 3 + 2] = v.z;
    }
    
    return {
      positions: pos,
      attributes: {
        aTarget: { value: target, size: 3 },
        aSize: { value: sizes, size: 1 }
      }
    };
  }, [count]);

  useEffect(() => {
    let currentShape = 0;
    const interval = setInterval(() => {
      currentShape = (currentShape + 1) % 5; 
      if (!meshRef.current) return;
      
      const newTarget = meshRef.current.geometry.attributes.aTarget.array as Float32Array;
      for(let i=0; i<count; i++) {
        const v = generateShape(currentShape, i, count);
        newTarget[i*3] = v.x;
        newTarget[i*3+1] = v.y;
        newTarget[i*3+2] = v.z;
      }
      meshRef.current.geometry.attributes.aTarget.needsUpdate = true;
      uniforms.current.uMix.value = 0;
      
    }, SHAPE_Duration);

    return () => clearInterval(interval);
  }, [count]);

  useFrame((state) => {
    const { clock } = state;
    uniforms.current.uTime.value = clock.getElapsedTime();
    uniforms.current.uMouse.value.set(mouseRef.current[0], mouseRef.current[1]);
    
    // Very smooth morphing
    uniforms.current.uMix.value = THREE.MathUtils.lerp(uniforms.current.uMix.value, 1, 0.015);
  });

  return (
    <Points ref={meshRef}>
      <BufferGeometry>
        <BufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <BufferAttribute
          attach="attributes-aTarget"
          count={attributes.aTarget.value.length / 3}
          array={attributes.aTarget.value}
          itemSize={3}
        />
         <BufferAttribute
          attach="attributes-aSize"
          count={attributes.aSize.value.length}
          array={attributes.aSize.value}
          itemSize={1}
        />
      </BufferGeometry>
      <ShaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms.current}
      />
    </Points>
  );
};