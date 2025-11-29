import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, Zap, Wind, Scale, Terminal } from 'lucide-react';

interface IntroProps {
  onStart: () => void;
}

// 7 Virtues Alchemical Mapping
const ALCHEMY_STAGES = [
  { 
    id: 1, virtue: 'Temperance', cn: '节制', candy: 'Hard Candy', 
    metal: 'Lead', planet: 'Saturn', symbol: '♄', color: '#9affdc', // Mint
    desc: 'Restrict desire to preserve the self.' 
  },
  { 
    id: 2, virtue: 'Faith', cn: '信仰', candy: 'Macaron', 
    metal: 'Tin', planet: 'Jupiter', symbol: '♃', color: '#d4b3ff', // Lavender
    desc: 'Trust in the unseen algorithm.' 
  },
  { 
    id: 3, virtue: 'Justice', cn: '正义', candy: 'Fondant', 
    metal: 'Gold', planet: 'Sun', symbol: '☉', color: '#e6c288', // Gold
    desc: 'The absolute weight of the soul.' 
  },
  { 
    id: 4, virtue: 'Fortitude', cn: '坚毅', candy: 'Tiramisu', 
    metal: 'Iron', planet: 'Mars', symbol: '♂', color: '#ff9ec4', // Rose
    desc: 'Endurance through the static noise.' 
  },
  { 
    id: 5, virtue: 'Charity', cn: '仁爱', candy: 'Canelé', 
    metal: 'Copper', planet: 'Venus', symbol: '♀', color: '#f6ad55', // Orange/Copper
    desc: 'connection creates flow.' 
  },
  { 
    id: 6, virtue: 'Knowledge', cn: '知识', candy: 'Chocolate', 
    metal: 'Mercury', planet: 'Mercury', symbol: '☿', color: '#8afff7', // Cyan
    desc: 'Fluid data, ever-changing truth.' 
  },
  { 
    id: 7, virtue: 'Hope', cn: '希望', candy: 'Glass Candy', 
    metal: 'Silver', planet: 'Moon', symbol: '☾', color: '#e2e8f0', // Silver
    desc: 'Reflecting light in the void.' 
  },
];

const ECHO_WORDS = ["INIT_ALCHEMY", "PARSING_SUGAR", "CALC_METALS", "SYNC_MEMORY", "VIRTUE_CHECK"];

export const CandybugIntro: React.FC<IntroProps> = ({ onStart }) => {
  const [activeStage, setActiveStage] = useState<number>(0); 
  const [echo, setEcho] = useState("");

  // Random "Terminal Text" effect
  useEffect(() => {
    const interval = setInterval(() => {
      setEcho(ECHO_WORDS[Math.floor(Math.random() * ECHO_WORDS.length)]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0d0a12] overflow-hidden flex flex-col md:flex-row items-center justify-center font-sans text-gray-300 selection:bg-rose-500/30 p-6">
      
      {/* --- LAYER 0: Background Atmosphere --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[100vmax] h-[100vmax] opacity-[0.05] animate-[spin_120s_linear_infinite]" 
             style={{ background: `radial-gradient(circle, transparent 30%, #14121c 70%), repeating-conic-gradient(from 0deg, #9affdc 0deg 1deg, transparent 1deg 15deg)` }}>
        </div>
      </div>

      {/* --- LEFT SIDE: ALCHEMY CIRCLE --- */}
      <div className="relative z-10 w-full md:w-1/2 h-[50vh] md:h-full flex items-center justify-center perspective-1000">
        
        {/* Central Core: Planetary Symbol */}
        <motion.div 
           className="relative z-20 w-56 h-56 rounded-full flex flex-col items-center justify-center backdrop-blur-md bg-[#0d0a12]/80 border border-white/10"
           animate={{ 
             boxShadow: `0 0 ${40}px ${ALCHEMY_STAGES[activeStage].color}20`,
             borderColor: ALCHEMY_STAGES[activeStage].color 
           }}
           transition={{ duration: 0.5 }}
        >
          {/* Rotating Rings */}
          <div className="absolute inset-[-10px] border border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-[-25px] border border-dotted border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

          {/* Symbol Display */}
          <motion.div 
            key={activeStage}
            initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            className="flex flex-col items-center text-center"
          >
            <span className="text-7xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ color: ALCHEMY_STAGES[activeStage].color }}>
              {ALCHEMY_STAGES[activeStage].symbol}
            </span>
            <span className="font-cinzel text-xl tracking-[0.2em] text-white">
              {ALCHEMY_STAGES[activeStage].planet.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-gray-500 tracking-[0.3em] uppercase mt-1">
              // {ALCHEMY_STAGES[activeStage].metal} // {ALCHEMY_STAGES[activeStage].candy}
            </span>
          </motion.div>
        </motion.div>

        {/* Orbiting Nodes */}
        {ALCHEMY_STAGES.map((stage, index) => {
          const total = ALCHEMY_STAGES.length;
          const angle = (index / total) * 2 * Math.PI - (Math.PI / 2); 
          const radius = 200; 
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = activeStage === index;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, x, y }}
              transition={{ delay: index * 0.1, type: "spring" }}
              className="absolute z-30"
            >
               {/* Connector */}
               <motion.div 
                 className="absolute top-1/2 left-1/2 h-px origin-left -z-10"
                 style={{ width: radius, transform: `rotate(${angle * (180/Math.PI) + 180}deg)`, background: isActive ? stage.color : 'rgba(255,255,255,0.05)' }} 
               />

               <motion.button
                 onClick={() => setActiveStage(index)}
                 onHoverStart={() => setActiveStage(index)}
                 animate={{ scale: isActive ? 1.3 : 1, borderColor: isActive ? stage.color : 'rgba(255,255,255,0.1)' }}
                 className="w-10 h-10 rounded-full border bg-[#0d0a12] flex items-center justify-center transition-all duration-300 relative group"
               >
                 <div className="w-2 h-2 rounded-full" style={{ background: stage.color }}></div>
               </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* --- RIGHT SIDE: PROTOCOL MANUAL --- */}
      <div className="relative z-20 w-full md:w-1/2 flex flex-col items-start justify-center pl-0 md:pl-12 gap-8">
        
        {/* Header */}
        <div>
           <motion.h1 
             key={activeStage}
             initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
             className="text-4xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 mb-2"
           >
             {ALCHEMY_STAGES[activeStage].virtue}
           </motion.h1>
           <p className="font-mono text-xs text-[#9affdc] tracking-widest flex items-center gap-2">
             <Terminal size={12} /> SYSTEM_MSG: {ALCHEMY_STAGES[activeStage].desc}
           </p>
        </div>

        {/* --- GAMEPLAY RULES (Kernel Debug) --- */}
        <div className="w-full max-w-lg bg-[#14121c]/80 border border-white/10 p-6 rounded-sm backdrop-blur-md relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <Database size={64} />
           </div>
           
           <h3 className="text-sm font-orbitron text-gray-400 mb-4 border-b border-white/10 pb-2 flex justify-between">
              <span>KERNEL DEBUG PROTOCOLS</span>
              <span className="text-[#ff9ec4] animate-pulse">● LIVE</span>
           </h3>

           <div className="space-y-4 font-mono text-xs md:text-sm text-gray-300 leading-relaxed">
              
              {/* SYNC */}
              <div className="flex gap-3">
                 <Activity className="text-[#e6c288] shrink-0" size={16} />
                 <div>
                    <strong className="text-[#e6c288] block mb-1">SYNC RATE (Memory)</strong>
                    Initial value: <span className="text-white">40%</span>. Reach <span className="text-white">60%</span> to interact with the Core.
                 </div>
              </div>

              {/* SPEED */}
              <div className="flex gap-3">
                 <Wind className="text-[#8afff7] shrink-0" size={16} />
                 <div>
                    <strong className="text-[#8afff7] block mb-1">LOCOMOTION LOGIC</strong>
                    <ul className="list-disc pl-4 space-y-1 text-gray-400">
                       <li>Sweetness &lt; 20: <span className="text-gray-500">Sluggish (0.5x Speed)</span></li>
                       <li>Buff == 'Frenzy': <span className="text-[#ff9ec4]">Hyperactive (1.5x Speed)</span></li>
                    </ul>
                 </div>
              </div>

              {/* STAMINA */}
              <div className="flex gap-3">
                 <Zap className="text-[#ff9ec4] shrink-0" size={16} />
                 <div>
                    <strong className="text-[#ff9ec4] block mb-1">MENTAL DRAIN (Sanity)</strong>
                    <ul className="list-disc pl-4 space-y-1 text-gray-400">
                       <li>Sweetness &gt; 80: <span className="text-[#ff9ec4]">Sugar Crash (2x Drain)</span></li>
                       <li>Buff == 'Temperance': <span className="text-[#9affdc]">Stable (Low Drain)</span></li>
                    </ul>
                 </div>
              </div>

              {/* CONSUME */}
              <div className="flex gap-3">
                 <Scale className="text-[#d4b3ff] shrink-0" size={16} />
                 <div>
                    <strong className="text-[#d4b3ff] block mb-1">CONSUME_SUGAR() FUNCTION</strong>
                    <p className="text-gray-400 italic">
                       Effect scales with current Sweetness level:
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-[10px] text-center">
                       <span className="bg-[#9affdc]/10 border border-[#9affdc]/30 py-1 rounded">Mental ++</span>
                       <span className="bg-[#ff9ec4]/10 border border-[#ff9ec4]/30 py-1 rounded">Greed ++</span>
                       <span className="bg-[#e6c288]/10 border border-[#e6c288]/30 py-1 rounded">Sync --</span>
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {/* Start Button */}
        <button 
          onClick={onStart}
          className="group relative px-8 py-3 w-full max-w-lg bg-transparent border-y border-white/20 overflow-hidden hover:bg-white/5 transition-all"
        >
           <div className="absolute top-0 left-0 w-1 h-full bg-[#9affdc] group-hover:h-full transition-all duration-300 h-0"></div>
           <div className="absolute bottom-0 right-0 w-1 h-full bg-[#ff9ec4] group-hover:h-full transition-all duration-300 h-0"></div>
           
           <div className="flex justify-between items-center font-orbitron tracking-[0.2em] text-sm">
             <span className="text-gray-500 group-hover:text-white transition-colors">INITIATE_DEBUG_SESSION</span>
             <Activity size={16} className="text-[#9affdc] animate-pulse" />
           </div>
        </button>

      </div>

    </div>
  );
};