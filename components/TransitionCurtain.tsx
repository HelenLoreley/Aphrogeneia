import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
  isLoading: boolean;
  onComplete?: () => void;
}

export const TransitionCurtain: React.FC<Props> = ({ isLoading, onComplete }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setPercent(0);
      const interval = setInterval(() => {
        setPercent(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + Math.floor(Math.random() * 3) + 1; // Slower, more organic progress
        });
      }, 60);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  return (
    <AnimatePresence mode='wait'>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center font-cinzel overflow-hidden"
        >
          {/* Background: Deep Nebula/Void */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a103c_0%,_#050810_100%)] z-0" />
          
          {/* Floating Sparkles/Dust Overlay */}
          <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Spinning Magic Circle / Glyph (CSS only) */}
            <div className="absolute w-64 h-64 border border-lavender/20 rounded-full animate-[spin_10s_linear_infinite] blur-[1px]"></div>
            <div className="absolute w-48 h-48 border border-cyan/20 rounded-full animate-[spin_15s_linear_infinite_reverse] blur-[0.5px]"></div>
            
            {/* Main Text with Cinematic Glow */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5 }}
              className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-gold font-bold tracking-widest text-glow mb-8 text-center px-4"
            >
              SUMMONING WORLD...
            </motion.h1>

            {/* Mana Line Progress Bar */}
            <div className="w-64 md:w-96 h-px bg-white/10 relative overflow-visible mt-4">
              {/* The glowing line */}
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_15px_rgba(154,255,220,0.8)]"
                style={{ width: `${percent}%` }}
              />
              {/* Leading particle */}
              <motion.div 
                 className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"
                 style={{ left: `${percent}%` }}
              />
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="mt-4 text-xs font-serif text-lavender tracking-[0.3em] uppercase"
            >
              Constructing dimensional Layer: {percent}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};