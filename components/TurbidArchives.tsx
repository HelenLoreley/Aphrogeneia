import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Layers, Database, Eye } from 'lucide-react';

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

const Corner = ({ className }: { className?: string }) => (
  <div className={`absolute w-3 h-3 border border-gray-500 ${className}`}>
    <div className="absolute inset-0 bg-transparent" />
  </div>
);

const Divider = ({ label }: { label?: string }) => (
  <div className="flex items-center gap-2 py-8 opacity-50">
    <div className="h-px bg-gray-600 flex-1" />
    {label && <span className="font-mono text-xs text-gray-400 tracking-widest uppercase">{label}</span>}
    <div className="h-px bg-gray-600 flex-1" />
  </div>
);

export const TurbidArchives: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-24 pb-32">
      
      {/* Header Metadata */}
      <motion.header 
        initial={{ opacity: 0 }} 
        whileInView={{ opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-700 pb-4 mb-16 font-mono text-xs text-gray-400 tracking-tight"
      >
        <div>AUTHOR: HELEN APHROICY</div>
        <div>YEAR: 2025</div>
        <div>SUBJECT: COGNITIVE RESONANCE</div>
        <div className="text-right text-crimson">DOC_ID: TRB-2025-X</div>
      </motion.header>

      {/* MODULE I: THE SHROUD */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative grid md:grid-cols-12 gap-8 border-l-2 border-crimson/50 pl-4 md:pl-8"
      >
        <div className="md:col-span-3">
          <h2 className="text-6xl md:text-8xl font-cinzel text-gray-800 absolute -top-10 -left-10 select-none -z-10">I.01</h2>
          <h2 className="text-3xl font-orbitron text-white mb-2">THE SHROUD</h2>
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-crimson/20 border border-crimson text-crimson text-xs font-mono font-bold animate-pulse">
            <ShieldAlert size={12} /> WARNING: ANOMALY
          </div>
        </div>

        <div className="md:col-span-9 relative bg-space/50 border border-gray-800 p-6 overflow-hidden group">
          <Corner className="top-0 left-0 border-t-2 border-l-2 border-crimson" />
          <Corner className="bottom-0 right-0 border-b-2 border-r-2 border-crimson" />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-sm font-serif text-gray-300 leading-relaxed text-justify">
              <p className="mb-4">
                The Turbid Disorder Era was triggered by an inexplicable global atmospheric anomaly: a higher-dimensional membrane, later termed <strong className="text-crimson">The Shroud</strong>, descended over the Earth.
              </p>
              <p>
                This phenomenon induced collective perceptual disorders, hallucinations, and information dissonance—later known as the Shroud Syndrome. The sky remains bathed in persistent crimson hues.
              </p>
            </div>
            
            {/* Data Loss Viz */}
            <div className="relative h-40 bg-black border border-gray-800 grid grid-cols-6 grid-rows-4 gap-1 p-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`bg-crimson/10 ${i % 3 === 0 ? 'animate-pulse bg-crimson/30' : ''} flex items-center justify-center`}
                >
                  <span className="text-[8px] text-crimson/50 font-mono">{Math.random() > 0.5 ? 'ERR' : 'NULL'}</span>
                </div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                <span className="text-crimson font-mono text-xl font-bold tracking-widest border border-crimson px-4 py-1">DATA LOSS</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <Divider label="SYSTEM: SFP-OS" />

      {/* MODULE II: SYNTHESIS FUN PALACE */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="grid md:grid-cols-12 gap-6"
      >
        {/* Agent Profile */}
        <div className="md:col-span-3 bg-gray-900/50 border border-gray-700 p-4 flex flex-col items-center text-center group">
          <div className="w-full aspect-square bg-gray-800 mb-4 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
             <img src="/assets/turbid/boniposter1.PNG" alt="Boni" className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal" />
             <div className="absolute inset-0 bg-gradient-to-t from-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="font-orbitron text-cyan text-lg">BONI_BONE</div>
          <div className="font-mono text-xs text-gray-500">SYNTHETIC_IDOL_V1</div>
        </div>

        {/* Architecture & Units */}
        <div className="md:col-span-9 bg-gray-900/30 border border-gray-700 p-6 relative">
          <div className="absolute top-0 right-0 bg-gray-800 px-3 py-1 text-xs font-mono text-gray-400">MODULAR / NEUROSEMANTIC</div>
          
          <h3 className="text-2xl font-cinzel text-white mb-6 mt-2">THE SYNTHESIS FUN PALACE</h3>
          <p className="font-serif text-gray-400 text-sm mb-8 max-w-2xl">
            A Protocol for Post-Collapse Cognition. The physical framework uses modular steel structures, telescopic joints, and mobile partitioning units adapting to biosignals.
          </p>

          {/* Interactive Units */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'R.V', name: 'RESONANCE VAULT', desc: 'Frequency Capital', color: 'group-hover:text-cyan group-hover:border-cyan' },
              { id: 'E.S', name: 'EXTRACTED SENTIENCE', desc: 'Botanical feedback', color: 'group-hover:text-acid group-hover:border-acid' },
              { id: 'L.A', name: 'LUMINAL ANCHOR', desc: 'Time-rift marker', color: 'group-hover:text-gold group-hover:border-gold' }
            ].map(unit => (
              <div key={unit.id} className={`group border border-gray-700 p-4 cursor-crosshair transition-all hover:bg-white/5 ${unit.color}`}>
                <div className="font-mono text-2xl font-bold mb-2">{unit.id}</div>
                <div className="font-orbitron text-xs mb-1">{unit.name}</div>
                <div className="font-serif text-xs text-gray-500">{unit.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <Divider label="HYPERDIMENSIONAL ECOLOGY" />

      {/* MODULE III: THE GOD-EYED */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="bg-black border border-yellow-600/30 relative overflow-hidden grid md:grid-cols-2"
      >
        {/* Scanline BG */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(transparent_50%,rgba(202,138,4,0.2)_50%)] bg-[length:100%_4px] animate-pulse" />

        <div className="p-8 relative z-10">
           <h3 className="text-3xl font-cinzel text-yellow-600 mb-6 flex items-center gap-3">
             <Eye className="animate-pulse" /> THE GOD-EYED
           </h3>
           <div className="space-y-6 font-mono text-sm text-gray-300">
             <div>
               <strong className="text-yellow-600 block mb-1">&gt;  CHRONO-EYE</strong>
               Perceive reversed time; active in theoretical domains.
             </div>
             <div>
               <strong className="text-gray-500 block mb-1">&gt; THANATOS-EYE</strong>
               Emotionally muted; catalysts for systemic collapse.
             </div>
             <div>
               <strong className="text-gray-500 block mb-1">&gt; ORACLE-EYE</strong>
               Guided by prophetic protocols; psychological infiltration.
             </div>
           </div>
        </div>

        <div className="bg-yellow-900/5 border-l border-yellow-600/30 flex items-center justify-center p-8 relative overflow-hidden">
           <div className="w-48 h-48 border border-yellow-600/50 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
              <div className="w-32 h-32 border border-yellow-600/30 rotate-45" />
              <div className="absolute w-full text-center font-mono text-[10px] text-yellow-600 tracking-[0.5em]">
                END OF ARCHIVE
              </div>
           </div>
        </div>
      </motion.section>

    </div>
  );
};