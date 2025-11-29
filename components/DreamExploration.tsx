import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { translations, Lang } from '../translations';

// --- 1. Background Scene (3D 梦幻背景) ---
const DreamBackground = () => {
  const groupRef = useRef<THREE.Group>(null);

  // 金星玫瑰星轨
  const VenusRose = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const { positions, colors } = useMemo(() => {
      const count = 4000;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const color1 = new THREE.Color("#e6c288");
      const color2 = new THREE.Color("#4fd1c5");

      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2 * 5;
        const R = 8; const r = 5; const d = 5;
        let x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
        let y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
        let z = (Math.random() - 0.5) * 1.5;
        
        x *= 0.4; y *= 0.4;

        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;

        const mixFactor = Math.random();
        const c = color1.clone().lerp(color2, mixFactor);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      return { positions: pos, colors: col };
    }, []);

    useFrame((state) => {
      if (pointsRef.current) {
        pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
      }
    });

    return (
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
      </points>
    );
  };

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} color="#4c1d95" />
      <VenusRose />
      <Stars radius={50} depth={20} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#e6c288" />
      
      <Float speed={2} rotationIntensity={1} floatIntensity={1} position={[-4, 2, -2]}>
         <mesh rotation={[0.5, 0.5, 0]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#8afff7" emissive="#8afff7" emissiveIntensity={1} wireframe />
         </mesh>
      </Float>
      <Float speed={3} rotationIntensity={1} floatIntensity={1} position={[4, -2, -2]}>
         <mesh>
            <tetrahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial color="#ff9ec4" emissive="#ff9ec4" emissiveIntensity={1} wireframe />
         </mesh>
      </Float>
    </group>
  );
};

// --- 2. Main Component ---
interface DreamProps {
  lang: Lang;
}

export const DreamExploration: React.FC<DreamProps> = ({ lang }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = translations[lang];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(console.error);
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full h-full relative bg-[#030305] overflow-hidden">
      
      {/* Layer 1: 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false }}>
          <fog attach="fog" args={['#030305', 3, 15]} />
          <DreamBackground />
        </Canvas>
      </div>

      {/* Layer 2: Character Image (Centered) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative h-[85vh] w-auto max-w-full flex items-center justify-center"
        >
          {/* 光晕 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#e6c288]/10 via-transparent to-transparent blur-3xl scale-150 rounded-full" />
          
          {/* 立绘 */}
          <img 
            src="/assets/Helen/Helen.png" 
            alt="Helen Character" 
            className="h-full w-auto object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            style={{ 
              maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
            }}
          />
          
          {/* 呼吸动画 */}
          <style>{`
            @keyframes breathe {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            img { animation: breathe 6s ease-in-out infinite; }
          `}</style>
        </motion.div>
      </div>

      {/* Layer 3: UI Overlay (Structured Layout) */}
      <div className="absolute inset-0 z-20 pointer-events-none p-8 md:p-12 flex flex-col justify-between">
        
        {/* --- 装饰性边框 (Frame) --- */}
        <div className="absolute top-8 left-8 w-24 h-24 border-t border-l border-white/10"></div>
        <div className="absolute top-8 right-8 w-24 h-24 border-t border-r border-white/10"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 border-b border-l border-white/10"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 border-b border-r border-white/10"></div>

        {/* --- 右上角：标题 (Visual Entry) --- */}
        <div className="self-end text-right pointer-events-auto mt-4 mr-4">
           <motion.h2 
             initial={{ opacity: 0, y: -20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 1 }}
             className="text-4xl md:text-6xl font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-[#fff] to-[#e6c288] drop-shadow-[0_0_15px_rgba(230,194,136,0.3)]"
           >
             {t.dreamTitle}
           </motion.h2>
           <motion.div 
             initial={{ width: 0 }}
             whileInView={{ width: '100%' }}
             transition={{ duration: 1.5, delay: 0.5 }}
             className="h-px bg-gradient-to-l from-gold to-transparent my-2 ml-auto"
           />
           <p className="text-xs font-serif text-gold/80 tracking-[0.3em] uppercase">
             {t.dreamSubtitle}
           </p>
        </div>

        {/* --- 左下角：音乐播放器 (Visual Anchor) --- */}
        <div className="self-start pointer-events-auto mb-4 ml-4 flex flex-col items-center gap-4">
           {/* 垂直装饰线 */}
           <div className="h-16 w-px bg-gradient-to-b from-transparent via-gold/40 to-gold/10"></div>
           
           <div className="writing-vertical-rl rotate-180 text-[10px] font-orbitron text-gold/70 tracking-widest opacity-80 py-2">
             {isPlaying ? "KAIROS . PLAYING" : "SOUNDSCAPE . OFF"}
           </div>

           <button 
             onClick={togglePlay}
             className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-md hover:border-gold hover:shadow-[0_0_15px_#e6c288] transition-all duration-700 text-gray-300 group"
           >
             {isPlaying ? 
                <Pause size={14} className="group-hover:text-gold transition-colors" /> : 
                <Play size={14} className="ml-0.5 group-hover:text-gold transition-colors" />
             }
           </button>
        </div>

      </div>

      <audio ref={audioRef} src="/assets/music/Intro-Kairos.mp3" loop crossOrigin="anonymous" />
    </div>
  );
};