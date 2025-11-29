import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Volume2, VolumeX, ArrowDown } from 'lucide-react';
import { TurbidArchives } from './TurbidArchives';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      span: any;
      section: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      p: any;
      a: any;
      button: any;
      img: any;
      video: any;
      canvas: any;
      input: any;
      style: any;
      aside: any;
      main: any;
      strong: any;
    }
  }
}

interface Props {
  onExit: () => void;
}

export const TurbidView: React.FC<Props> = ({ onExit }) => {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    // Main Container that scrolls
    <div className="w-full h-screen overflow-y-auto bg-[#050508] text-gray-200 flex flex-row">
      
      {/* 1. STICKY SIDEBAR (Mix-blend-difference) */}
      <aside className="sticky top-0 h-screen w-16 md:w-20 z-50 flex flex-col justify-between items-center py-8 border-r border-white/10 mix-blend-difference text-white pointer-events-none md:pointer-events-auto shrink-0 bg-[#050508]/20 backdrop-blur-sm">
        {/* --- 修改点 1：Logo 替换 --- */}
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
           <img 
             src="/assets/turbid/tde_logo.png" 
             alt="TDE Logo" 
             className="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
           />
        </div>
        
        {/* Vertical Title */}
        <div className="flex-1 flex items-center justify-center">
          <div className="writing-vertical-rl rotate-180 text-[10px] md:text-xs tracking-[0.3em] font-mono text-gray-400 whitespace-nowrap opacity-80">
            TURBID DISORDER / 浊隅时代
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6 pointer-events-auto">
           <button onClick={toggleMute} className="group relative flex justify-center hover:scale-110 transition-transform">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <div className={`absolute -right-2 top-0 w-1.5 h-1.5 rounded-full ${muted ? 'bg-gray-600' : 'bg-green-400'}`} />
           </button>
           <button onClick={onExit} className="hover:text-crimson transition-colors hover:scale-110" title="EXIT">
              <LogOut size={18} />
           </button>
        </div>
      </aside>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HERO SECTION (Full Video) */}
        <section className="relative w-full h-screen shrink-0 overflow-hidden bg-black">
          {/* Fallback background if video fails */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />

          <video 
            ref={videoRef}
            src="/assets/turbid/BoniTrailer.mp4" 
            autoPlay 
            loop 
            muted={muted} 
            className="absolute inset-0 w-full h-full object-cover opacity-80 z-0"
            playsInline
            onError={(e) => console.error("Video load error:", e)}
          />
          
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508] z-10" />
          
          {/* Scroll Hint */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs font-orbitron text-gray-500 tracking-widest z-20"
          >
            <span>SCROLL TO ACCESS ARCHIVES</span>
            <ArrowDown size={14} className="animate-bounce" />
          </motion.div>
        </section>

        {/* ARCHIVES (Scroll Content) */}
        <main className="relative z-10 bg-[#050508] border-l border-white/5 min-h-screen">
          
          {/* --- 修改点 2：添加合成欢乐宫 (SFP) 的文件头 --- */}
          <div className="sticky top-0 z-40 w-full bg-[#050508]/90 backdrop-blur-md border-b border-white/10 py-3 px-6 md:px-12 flex items-center justify-between select-none">
            <div className="flex items-center gap-3 opacity-70">
              <img 
                src="/assets/turbid/sfp_logo.png" 
                alt="SFP Logo" 
                className="w-6 h-6 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase leading-none mb-1">
                  Archived by Synthetic Fun Palace
                </span>
                <span className="text-[10px] text-gray-400 font-orbitron tracking-widest leading-none">
                  SFP // CLASSIFIED DATABASE
                </span>
              </div>
            </div>
            
            {/* 装饰性的文件编号 */}
            <div className="hidden md:block text-[9px] font-mono text-gray-600 tracking-widest">
              DOC_REF: #9901-TDE
            </div>
          </div>

          {/* 实际档案内容 */}
          <div className="p-6 md:p-12">
            <TurbidArchives />
          </div>
        </main>
      </div>

      {/* Custom Styles for Vertical Text */}
      <style>{`
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
      `}</style>
    </div>
  );
};