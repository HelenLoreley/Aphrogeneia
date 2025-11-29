// src/App.tsx
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MathVortex } from './components/MathVortex';
import { ProjectTurbid, ProjectCandybug } from './components/ProjectViews';
import { TransitionCurtain } from './components/TransitionCurtain';
import { DreamExploration } from './components/DreamExploration'; // New Component
import { ViewState } from './types';
import { Github, Mail, Sparkles, BookOpen, Gamepad2, ArrowDown, Globe } from 'lucide-react';
import { translations, Lang } from './translations'; // Translations

// Fix for missing JSX types in the environment
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
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

const AmbientLight = 'ambientLight' as any;

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('en'); // Language State
  const mouseRef = useRef<[number, number]>([0, 0]);

  const t = translations[lang]; // Current Translation

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      ];
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const navigateTo = (view: ViewState) => {
    setIsLoading(true);
    setTimeout(() => {
      setViewState(view);
      setIsLoading(false);
    }, 2500);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.5 }
    }
  };

  const letterVars: Variants = {
    hidden: { opacity: 0, y: 10, filter: "blur(12px)" },
    visible: { 
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  const titleString = t.name;

  return (
    <>
      <TransitionCurtain isLoading={isLoading} />
      
      {/* Language Toggle (Fixed Top Right) */}
      <div className="fixed top-6 right-6 z-[60]">
        <button 
          onClick={toggleLang}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-orbitron text-gray-300 hover:text-gold hover:border-gold transition-all"
        >
          <Globe size={14} />
          {lang === 'en' ? 'CN' : 'EN'}
        </button>
      </div>

      {/* Background 3D Layer (Only on Home) */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${viewState === ViewState.HOME ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ antialias: false }}>
          <Suspense fallback={null}>
            <MathVortex mouseRef={mouseRef} count={35000} />
            <AmbientLight intensity={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <AnimatePresence>
        {viewState === ViewState.HOME && (
          <motion.main 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="snap-container relative z-10 w-full h-screen overflow-y-scroll text-gold font-serif"
          >
            {/* Custom Cursor */}
            <div className="fixed pointer-events-none z-[60] mix-blend-difference hidden md:block" 
                 style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            </div>

            {/* --- SCREEN 1: HERO --- */}
            <section className="snap-section min-h-screen flex flex-col items-center justify-center p-6 text-center relative">
              <div className="relative z-10">
                <motion.h2 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.5 }}
                  className="text-xs md:text-sm font-orbitron tracking-[0.8em] text-cyan/40 mb-6 animate-pulse"
                >
                  {t.role.toUpperCase()}
                </motion.h2>

                <motion.h1 
                  variants={containerVars} initial="hidden" animate="visible"
                  className="text-5xl md:text-9xl font-cinzel font-bold text-white mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] flex justify-center flex-wrap gap-1"
                >
                  {titleString.split("").map((char, index) => (
                    <motion.span key={index} variants={letterVars}>{char}</motion.span>
                  ))}
                </motion.h1>

                <motion.div 
                  initial={{ width: 0, opacity: 0 }} animate={{ width: "100px", opacity: 0.5 }} transition={{ delay: 2, duration: 1.5 }}
                  className="h-px bg-white/30 mx-auto my-6" 
                />
                
                <motion.h2 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1.5 }}
                  className="text-xs md:text-sm font-serif font-light text-gray-400/80 tracking-[0.3em]"
                >
                  {t.intro}
                </motion.h2>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 3 }}
                className="absolute bottom-10 animate-bounce flex flex-col items-center"
              >
                <span className="text-[10px] font-orbitron tracking-widest mb-2">{t.scroll}</span>
                <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
              </motion.div>
            </section>

            {/* --- SCREEN 2: PROFILE & PROJECTS --- */}
            <section className="snap-section min-h-screen flex items-center justify-center p-4 md:p-12 bg-black/30 backdrop-blur-[2px]">
              <motion.div 
                initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
                className="w-full max-w-5xl glass-panel rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row relative group"
              >
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/10" />

                {/* Left: Avatar & Bio */}
                <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center text-center relative overflow-hidden bg-black/20">
                  <div className="relative w-40 h-40 mb-6 group/avatar">
                    <div className="absolute inset-[-10px] rounded-full border border-dashed border-cyan/20 animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute inset-[-5px] rounded-full border border-dotted border-gold/20 animate-[spin_15s_linear_infinite_reverse]"></div>
                    <div className="w-full h-full rounded-full overflow-hidden border border-white/10 relative z-10 transition-all duration-700 ease-out shadow-[0_0_0_rgba(0,0,0,0)] group-hover/avatar:shadow-[0_0_30px_rgba(154,255,220,0.5),0_0_60px_rgba(212,179,255,0.3)] group-hover/avatar:scale-105">
                        <img 
                          src="/assets/Helen/Avatar.PNG" 
                          alt="Helen Avatar" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/0 via-white/0 to-pink-400/0 group-hover/avatar:from-cyan-400/20 group-hover/avatar:via-white/10 group-hover/avatar:to-pink-400/20 transition-all duration-700 pointer-events-none mix-blend-overlay opacity-0 group-hover/avatar:opacity-100"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-cinzel text-white mb-2 text-glow">{t.identityTitle}</h3>
                  <p className="text-xs text-gray-500 font-serif leading-loose mb-6 tracking-wide">
                    {t.identityDesc}
                  </p>
                  
                  <div className="flex gap-4">
                    <a href="mailto:icylachrymose@gmail.com" className="p-2 border border-white/10 rounded-full hover:bg-white/10 hover:text-cyan-200 transition-all">
                      <Mail size={16} />
                    </a>
                    <div className="p-2 border border-white/10 rounded-full hover:bg-white/10 hover:text-cyan-200 transition-all cursor-not-allowed">
                      <Github size={16} />
                    </div>
                  </div>
                </div>

                {/* Right: Projects */}
                <div className="w-full md:w-2/3 p-8 bg-gradient-to-br from-transparent to-black/40">
                  <h3 className="text-lg font-orbitron tracking-[0.2em] text-gray-600 mb-8 flex items-center gap-2">
                    <Sparkles size={14} className="text-gold" /> {t.projectsTitle}
                  </h3>

                  <div className="grid gap-6">
                    <div onClick={() => navigateTo(ViewState.TURBID)} className="group/card relative p-6 bg-white/5 border border-white/5 hover:border-crimson/50 transition-all duration-500 cursor-pointer overflow-hidden rounded backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-r from-crimson/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                           <h4 className="text-xl font-cinzel text-white group-hover/card:text-crimson transition-colors group-hover/card:text-glow">{t.turbidTitle}</h4>
                           <p className="text-[10px] text-gray-500 mt-1 font-orbitron tracking-widest">{t.turbidTag}</p>
                        </div>
                        <BookOpen className="text-gray-600 group-hover/card:text-crimson transition-colors" size={20} />
                      </div>
                      <p className="relative z-10 mt-4 text-xs text-gray-400 font-serif group-hover/card:text-gray-200 transition-colors leading-relaxed">
                        {t.turbidDesc}
                      </p>
                    </div>

                    <div onClick={() => navigateTo(ViewState.CANDYBUG)} className="group/card relative p-6 bg-white/5 border border-white/5 hover:border-pink-500/50 transition-all duration-500 cursor-pointer overflow-hidden rounded backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                      <div className="relative z-10 flex justify-between items-start">
                         <div>
                           <h4 className="text-xl font-cinzel text-white group-hover/card:text-pink-300 transition-colors group-hover/card:text-glow">{t.candyTitle}</h4>
                           <p className="text-[10px] text-gray-500 mt-1 font-orbitron tracking-widest">{t.candyTag}</p>
                         </div>
                         <Gamepad2 className="text-gray-600 group-hover/card:text-pink-300 transition-colors" size={20} />
                      </div>
                      <p className="relative z-10 mt-4 text-xs text-gray-400 font-serif group-hover/card:text-gray-200 transition-colors leading-relaxed">
                        {t.candyDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }} transition={{ delay: 1 }}
                className="absolute bottom-10 animate-bounce flex flex-col items-center"
              >
                <ArrowDown size={20} className="text-gray-500" />
                <span className="text-[9px] font-orbitron tracking-widest mt-2 text-gray-600">{t.explore}</span>
              </motion.div>
            </section>

            {/* --- SCREEN 3: DREAM EXPLORATION (Replaced Chaos Player) --- */}
            <section className="snap-section min-h-screen relative bg-[#050508] flex items-center justify-center overflow-hidden">
                <DreamExploration lang={lang} />
            </section>

          </motion.main>
        )}

        {viewState === ViewState.TURBID && (
          <motion.div key="turbid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-20 bg-[#050508]">
            <ProjectTurbid onBack={() => navigateTo(ViewState.HOME)} />
          </motion.div>
        )}
        {viewState === ViewState.CANDYBUG && (
          <motion.div key="candy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-20 overflow-y-auto bg-void">
             <ProjectCandybug onBack={() => navigateTo(ViewState.HOME)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;