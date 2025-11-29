import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, LogOut, RefreshCw, Play } from 'lucide-react';
import { TurbidView } from './TurbidView';
import { CandybugIntro } from './CandybugIntro'; 

// --- TYPES & INTERFACES ---
interface ProjectProps {
  onBack: () => void;
}

// --- PROJECT A: TURBID DISORDER ERA (Wrapper) ---
export const ProjectTurbid: React.FC<ProjectProps> = ({ onBack }) => {
  return <TurbidView onExit={onBack} />;
};

// --- PROJECT B: CANDYBUG (Full RPG Port) ---
export const ProjectCandybug: React.FC<ProjectProps> = ({ onBack }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [activeGame, setActiveGame] = useState(false); 

  const handleStartGame = () => {
    setShowIntro(false);
    setTimeout(() => {
        setActiveGame(true);
    }, 800); 
  };

  return (
    <div className="fixed inset-0 bg-[#0d0a12] font-sans text-[#e0e0e0] overflow-hidden cursor-crosshair">
       <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-50"
          >
            <CandybugIntro onStart={handleStartGame} />
            <button onClick={onBack} className="absolute top-6 right-6 z-[60] text-gray-500 hover:text-white transition-colors opacity-50 hover:opacity-100">
              <LogOut size={20} />
            </button>
          </motion.div>
        ) : (
          <CandybugGameInterface onBack={onBack} active={activeGame} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- THE GAME INTERFACE & LOGIC ---
const CandybugGameInterface: React.FC<{ onBack: () => void, active: boolean }> = ({ onBack, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const INITIAL_PARAMS = { 
    sweetness: 50, stamina: 100, greed: 10, sync: 40, buff: null as string | null 
  };
  
  const TILE_SIZE = 64;

  // 0=Floor, 1=Wall, 2=Memory, 3=Trap, 4=Core, 5=SugarCache
  // UPDATED: More complex maze structure
  const GET_INITIAL_MAP = () => [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,1,2,0,0,5,1], // Row 1
    [1,0,1,0,1,0,1,1,0,1,1,1,1,0,1], // Row 2
    [1,0,1,0,0,0,1,5,0,0,0,0,1,0,1], // Row 3
    [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1], // Row 4 (Wall barrier)
    [1,0,0,0,0,0,0,3,0,0,0,0,0,0,1], // Row 5 (Open area with trap)
    [1,1,1,0,1,1,1,1,1,1,0,1,1,1,1], // Row 6
    [1,2,0,0,1,0,0,0,3,1,0,0,2,0,1], // Row 7
    [1,0,1,1,1,0,1,1,0,1,0,1,1,0,1], // Row 8
    [1,5,0,0,0,0,1,4,0,1,0,3,0,0,1], // Row 9 (Core hidden at [9][7])
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  const [params, setParams] = useState(INITIAL_PARAMS);
  const [dialogue, setDialogue] = useState<{ text: string, choices: { label: string, action: () => void }[] } | null>(null);
  const [ending, setEnding] = useState<{ title: string, desc: string, color: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const PATHS = {
    portrait: '/assets/candy/Daniella.png',
    tachie: '/assets/candy/Daniella_neutral.png',
    sprites: '/assets/candy/sprites/' 
  };

  const COLORS = {
    mint: '#9affdc',
    rose: '#ff9ec4',
    lavender: '#d4b3ff',
    gold: '#e6c288',
    cyan: '#8afff7'
  };

  const gameState = useRef({
    // UPDATED: Added targetX/targetY for grid-based movement
    player: { 
        x: 64, y: 64, 
        targetX: 64, targetY: 64, 
        dir: 'D', frame: 1, animTimer: 0, isMoving: false 
    },
    keys: {} as Record<string, boolean>,
    map: GET_INITIAL_MAP(),
    sprites: {} as Record<string, HTMLImageElement | null>
  });

  const CFG = { tileSize: 64, cols: 15, rows: 11, baseSpeed: 4 };

  const restartGame = () => {
    setParams(INITIAL_PARAMS);
    setDialogue(null);
    setEnding(null);
    setPaused(false);
    setIsMenuOpen(false);
    gameState.current.map = GET_INITIAL_MAP();
    gameState.current.player = { 
        x: 64, y: 64, 
        targetX: 64, targetY: 64, 
        dir: 'D', frame: 1, animTimer: 0, isMoving: false 
    };
    gameState.current.keys = {};
  };

  useEffect(() => {
    const directions = ['D', 'U', 'L', 'R'];
    directions.forEach(dir => {
      for(let i=1; i<=4; i++) {
        const key = `${dir}${i}`;
        const img = new Image();
        img.src = `${PATHS.sprites}${key}.png`;
        img.onload = () => { gameState.current.sprites[key] = img; };
      }
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Check if a tile is walkable
    const isWalkable = (tx: number, ty: number) => {
        if(tx < 0 || tx >= CFG.cols || ty < 0 || ty >= CFG.rows) return false;
        return gameState.current.map[ty][tx] !== 1; // 1 is Wall
    };

    const triggerEvent = (type: string, tx: number, ty: number) => {
      // Don't remove tile immediately if it's the core, so it stays visible
      if(type !== 'core') gameState.current.map[ty][tx] = 0; 
      
      setPaused(true);
      
      if (type === "memory") {
        setParams(p => ({ ...p, sync: Math.min(100, p.sync + 20) }));
        setDialogue({
          text: "A fragment of memory... It tastes like sweet nostalgia. (Sync +20%)",
          choices: [{ label: "Integrate", action: () => { setDialogue(null); setPaused(false); } }]
        });
      } else if (type === "trap") {
        setParams(p => ({ ...p, greed: Math.min(100, p.greed + 15), stamina: Math.max(0, p.stamina - 20) }));
        setDialogue({
          text: "IT BURNS! A hidden firewall protocol. (Stamina -20, Greed +15)",
          choices: [{ label: "Recover", action: () => { setDialogue(null); setPaused(false); } }]
        });
      } else if (type === "sugar") {
        setParams(p => ({ ...p, stamina: Math.min(100, p.stamina + 25) }));
        setDialogue({
            text: "A cache of raw data sugar. Pure energy.",
            choices: [{ label: "Consume", action: () => { setDialogue(null); setPaused(false); } }]
        });
      } else if (type === "core") {
        if (params.sync < 60) {
            setDialogue({
                text: "The Philosopher's Stone is obscured by static... You lack the synchronization to interact with it. (Req: 60% Sync)",
                choices: [{ label: "Step Back", action: () => { 
                    // Force step back logic handled by not entering tile technically, 
                    // but since we are on grid, we just resume and let player walk away.
                    setDialogue(null); setPaused(false); 
                } }]
            });
        } else {
            setDialogue({
              text: "The Philosopher's Stone... The final variable. With this, I can rewrite the code of this world.",
              choices: [
                { label: "Calibrate World Order (Good)", action: () => concludeGame('good') },
                { label: "Linger in Dream (Neutral)", action: () => concludeGame('neutral') },
                { label: "Consume Everything (Bad)", action: () => concludeGame('bad') }
              ]
            });
        }
      }
    };

    const concludeGame = (type: string) => {
       setDialogue(null);
       if (type === 'good') setEnding({ title: "INFINITE BALANCE", desc: "Order is restored. Dimensions merged. I am no longer a sinner, but a guardian.", color: COLORS.mint });
       else if (type === 'neutral') setEnding({ title: "FRAGMENTED REUNION", desc: "It's not perfect, but I can see him. I will stay in this broken simulation forever.", color: COLORS.lavender });
       else setEnding({ title: "DATA CORRUPTION", desc: "I drowned in the sweetness. My desire consumed the world, leaving only void.", color: COLORS.rose });
    };

    const update = () => {
      ctx.fillStyle = '#0a090c'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const p = gameState.current.player;

      // --- RENDER MAP & FOG ---
      for(let y=0; y<CFG.rows; y++) {
          for(let x=0; x<CFG.cols; x++) {
              const t = gameState.current.map[y][x];
              const tx = x*CFG.tileSize, ty = y*CFG.tileSize;
              
              // FOG CALCULATION (Based on Player Visual Center)
              // Visual center is current pixel position + half tile
              const pCx = p.x + 32; const pCy = p.y + 32;
              const tileCx = tx + 32; const tileCy = ty + 32;
              const dist = Math.sqrt(Math.pow(pCx - tileCx, 2) + Math.pow(pCy - tileCy, 2));
              
              // UPDATED: Harder Fog (Radius reduced from 300 to 160)
              let opacity = 1;
              if (dist > 180) opacity = 0; // Pitch black
              else if (dist > 100) opacity = 1 - ((dist - 100) / 80); // Gradient

              if (opacity > 0) {
                  ctx.globalAlpha = opacity;
                  if(t===1) { // Wall
                      ctx.fillStyle = '#15121a'; ctx.fillRect(tx, ty, 64, 64);
                      ctx.strokeStyle = 'rgba(138, 255, 247, 0.1)'; ctx.lineWidth=1; ctx.strokeRect(tx, ty, 64, 64);
                      ctx.fillStyle = '#1f1a26'; ctx.fillRect(tx+16, ty+16, 32, 32);
                  } else if (t===2) { // Memory
                      ctx.fillStyle = COLORS.cyan; ctx.beginPath(); ctx.arc(tx+32, ty+32, 8, 0, Math.PI*2); ctx.fill();
                      ctx.shadowBlur=10; ctx.shadowColor=COLORS.cyan;
                  } else if (t===3) { // Trap (Hidden until close)
                      if(opacity > 0.8) {
                        ctx.strokeStyle = COLORS.rose; ctx.lineWidth=2; ctx.strokeRect(tx+20, ty+20, 24, 24);
                      }
                  } else if (t===4) { // Core
                      if (params.sync >= 60) {
                          ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.moveTo(tx+32, ty+10); ctx.lineTo(tx+54, ty+54); ctx.lineTo(tx+10, ty+54); ctx.fill();
                          ctx.shadowBlur=20; ctx.shadowColor=COLORS.gold;
                      } else {
                          // Obscure shape if low sync
                          ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(tx+32, ty+32, 12, 0, Math.PI*2); ctx.fill();
                      }
                  } else if (t===5) { // Sugar
                      ctx.fillStyle = COLORS.rose; ctx.font = "20px monospace"; ctx.fillText("🍬", tx+20, ty+40);
                  } else { // Floor
                      ctx.strokeStyle = 'rgba(154, 255, 220, 0.03)'; ctx.lineWidth=1; ctx.strokeRect(tx, ty, 64, 64);
                  }
                  ctx.shadowBlur=0;
                  ctx.globalAlpha = 1;
              }
          }
      }

      // --- RENDER PLAYER ---
      const spriteKey = `${p.dir}${p.frame}`;
      const img = gameState.current.sprites[spriteKey];
      if (img) ctx.drawImage(img, p.x, p.y, 64, 64);
      else {
        ctx.fillStyle = COLORS.mint; ctx.fillRect(p.x+16, p.y+8, 32, 48);
      }

      // --- GAME LOGIC ---
      if (!paused && !dialogue && !ending && !isMenuOpen) {
        
        // Endings Check
        if (params.greed >= 100) {
            setEnding({ title: "DATA CONSUMED", desc: "My avarice grew too great. The corruption has overwritten my source code.", color: COLORS.rose });
        } else if (params.stamina <= 0) {
            setEnding({ title: "SYSTEM CRASH", desc: "Insufficient energy to maintain consciousness. The void reclaims me.", color: '#888' });
        }

        // --- GRID BASED MOVEMENT LOGIC ---
        let speed = CFG.baseSpeed;
        if (params.buff === 'Frenzy') speed = 8; // Faster snap
        if (params.sweetness < 20) speed = 2; // Slower snap

        if (p.isMoving) {
            // Move towards target
            if (p.x < p.targetX) p.x = Math.min(p.targetX, p.x + speed);
            if (p.x > p.targetX) p.x = Math.max(p.targetX, p.x - speed);
            if (p.y < p.targetY) p.y = Math.min(p.targetY, p.y + speed);
            if (p.y > p.targetY) p.y = Math.max(p.targetY, p.y - speed);

            // Animation
            p.animTimer++;
            if (p.animTimer > (16/speed)*2) { 
                p.frame = (p.frame % 4) + 1; 
                p.animTimer = 0; 
            }

            // Check if reached target
            if (p.x === p.targetX && p.y === p.targetY) {
                p.isMoving = false;
                
                // Trigger Event on Arrival
                const tx = Math.floor((p.x + 32) / CFG.tileSize);
                const ty = Math.floor((p.y + 32) / CFG.tileSize);
                const tile = gameState.current.map[ty][tx];
                if (tile >= 2) triggerEvent(tile === 2 ? "memory" : tile === 3 ? "trap" : tile === 4 ? "core" : "sugar", tx, ty);
                
                // Drain Stamina Per Step (RPG style)
                let drain = 2; 
                if (params.buff === 'Temperance') drain = 0.5;
                if (params.sweetness > 80) drain = 4;
                setParams(prev => ({ ...prev, stamina: Math.max(0, prev.stamina - drain) }));
            }

        } else {
            // IDLE: Check Input to start moving
            const keys = gameState.current.keys;
            let nextX = p.x;
            let nextY = p.y;
            let moveRequested = false;

            if (keys['arrowup'] || keys['w']) { nextY -= TILE_SIZE; p.dir = 'U'; moveRequested = true; }
            else if (keys['arrowdown'] || keys['s']) { nextY += TILE_SIZE; p.dir = 'D'; moveRequested = true; }
            else if (keys['arrowleft'] || keys['a']) { nextX -= TILE_SIZE; p.dir = 'L'; moveRequested = true; }
            else if (keys['arrowright'] || keys['d']) { nextX += TILE_SIZE; p.dir = 'R'; moveRequested = true; }

            if (moveRequested) {
                // Convert pixels to grid coords
                const tx = Math.floor((nextX + 32) / TILE_SIZE);
                const ty = Math.floor((nextY + 32) / TILE_SIZE);

                if (isWalkable(tx, ty)) {
                    p.targetX = nextX;
                    p.targetY = nextY;
                    p.isMoving = true;
                }
            } else {
                p.frame = 1; // Idle frame
            }
        }
      }
      animId = requestAnimationFrame(update);
    };

    const handleKey = (e: KeyboardEvent, isDown: boolean) => { 
        if (e.key === 'Escape' && isDown) toggleMenu();
        gameState.current.keys[e.key.toLowerCase()] = isDown; 
    };
    window.addEventListener('keydown', (e) => handleKey(e, true));
    window.addEventListener('keyup', (e) => handleKey(e, false));
    update();

    return () => {
      window.removeEventListener('keydown', (e) => handleKey(e, true));
      window.removeEventListener('keyup', (e) => handleKey(e, false));
      cancelAnimationFrame(animId);
    };
  }, [paused, dialogue, ending, params.buff, params.sweetness, params.sync, params.greed, params.stamina, active, isMenuOpen]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    let buff = null;
    if (val >= 25 && val <= 35) buff = 'Temperance';
    else if (val >= 85) buff = 'Frenzy';
    setParams(p => ({ ...p, sweetness: val, buff }));
  };

  const consumeSugar = () => {
    const sRatio = params.sweetness / 100;
    const mentalGain = 10 + (30 * sRatio); 
    const greedGain = 5 + (20 * sRatio);
    const syncLoss = 5 + (15 * sRatio);
    setParams(p => ({ 
      ...p, 
      stamina: Math.min(100, p.stamina + mentalGain),
      greed: Math.min(100, p.greed + greedGain),
      sync: Math.max(0, p.sync - syncLoss)
    }));
  };

  const toggleMenu = () => {
      if (ending) return;
      const newState = !isMenuOpen;
      setIsMenuOpen(newState);
      setPaused(newState);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto"
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-200"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vmax] h-[120vmax] opacity-[0.15] animate-[spin_180s_linear_infinite] z-[-1]"
           style={{ background: `radial-gradient(circle, transparent 40%, #14121c 70%), repeating-conic-gradient(from 0deg, ${COLORS.lavender} 0deg 1deg, transparent 1deg 10deg)` }}>
      </div>

      <div className="relative w-[95%] h-[90%] max-w-[1600px] grid grid-cols-[320px_1fr_80px] gap-6 p-5 items-center z-10">
        
        {/* --- LEFT HUD --- */}
        <div className="bg-[#14121c]/90 border border-[#ff9ec4] p-6 h-full max-h-[720px] overflow-y-auto relative rounded backdrop-blur-md shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_0_30px_rgba(255,158,196,0.1)] flex flex-col">
           <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#e6c288]"></div>
           <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#e6c288]"></div>

           <div className={`w-full h-44 bg-[#050505] border border-[#d4b3ff] mb-6 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] 
                           ${params.stamina < 30 ? 'animate-[glitch_0.2s_infinite] contrast-150 brightness-125' : ''}
                           ${params.greed > 60 ? 'animate-[pulse_1s_infinite] sepia hue-rotate-[-50deg]' : ''}
                           ${params.buff ? 'shadow-[inset_0_0_20px_#9affdc] brightness-110 border-[#9affdc]' : ''}`}>
              <img src={PATHS.portrait} alt="Status" className="w-full h-full object-cover object-top" />
              {params.buff && (
                 <div className="absolute bottom-2 right-2 text-xs font-mono text-[#9affdc] shadow-[0_0_5px_#9affdc]">
                    BUFF ACTIVE
                 </div>
              )}
           </div>

           <div className="space-y-5 mb-8">
             <div className="mb-5">
               <div className="flex justify-between text-[#d4b3ff] text-sm font-bold mb-1.5 tracking-wider font-sans">
                 <span>MENTAL (Sanity)</span> <span>{Math.floor(params.stamina)}%</span>
               </div>
               <div className="h-1.5 bg-white/10 rounded-sm overflow-hidden">
                 <div style={{ width: `${params.stamina}%`, background: COLORS.mint, boxShadow: `0 0 10px ${COLORS.mint}` }} className="h-full transition-all duration-500" />
               </div>
             </div>
             <div className="mb-5">
               <div className="flex justify-between text-[#d4b3ff] text-sm font-bold mb-1.5 tracking-wider font-sans">
                 <span>GREED (Corruption)</span> <span>{Math.floor(params.greed)}%</span>
               </div>
               <div className="h-1.5 bg-white/10 rounded-sm overflow-hidden">
                 <div style={{ width: `${params.greed}%`, background: COLORS.rose, boxShadow: `0 0 10px ${COLORS.rose}` }} className="h-full transition-all duration-500" />
               </div>
             </div>
             <div>
               <div className="flex justify-between text-[#d4b3ff] text-sm font-bold mb-1.5 tracking-wider font-sans">
                 <span>SYNC (Memory)</span> <span>{Math.floor(params.sync)}%</span>
               </div>
               <div className="h-1.5 bg-white/10 rounded-sm overflow-hidden">
                 <div style={{ width: `${params.sync}%`, background: COLORS.gold, boxShadow: `0 0 10px ${COLORS.gold}` }} className="h-full transition-all duration-500" />
               </div>
             </div>
           </div>

           <div className="mt-8 border-t border-dashed border-white/15 pt-5 text-center">
              <div className="flex justify-center text-[#d4b3ff] text-sm font-bold mb-1.5 tracking-wider font-sans">
                 SWEETNESS: <span className="ml-2">{params.sweetness}%</span>
              </div>
              <input 
                 type="range" min="0" max="100" value={params.sweetness} onChange={handleSlider}
                 className="w-full h-1 bg-gradient-to-r from-[#9affdc] to-[#ff9ec4] rounded-sm appearance-none cursor-pointer mb-4 accent-[#e6c288]"
              />
              <button 
                 onClick={consumeSugar}
                 className="w-full py-3 mt-2 bg-[#ff9ec4]/5 border border-[#ff9ec4] text-[#ff9ec4] font-mono tracking-widest uppercase hover:bg-[#ff9ec4] hover:text-black hover:shadow-[0_0_25px_#ff9ec4] transition-all duration-300"
              >
                Consume Sugar Data
              </button>
           </div>
        </div>

        {/* --- CENTER VIEWPORT --- */}
        <div className="relative w-full h-full flex justify-center items-center">
           <div className="relative aspect-[960/704] w-full max-w-[960px] max-h-[704px] border border-[#8afff7] shadow-[0_0_0_1px_rgba(0,0,0,0.8),0_0_60px_rgba(138,255,247,0.1)] bg-[#050505] overflow-hidden">
              <canvas ref={canvasRef} width={960} height={704} className="w-full h-full block image-pixelated" />
              
              {/* Dialogue Layer */}
              <AnimatePresence>
                {dialogue && (
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                     className="absolute bottom-8 left-6 w-auto max-w-[85%] h-[220px] flex items-end z-[600] pointer-events-auto"
                   >
                      <div className="w-[180px] h-[250px] -mr-8 z-10 drop-shadow-2xl flex-shrink-0">
                         <img src={PATHS.tachie} className="w-full h-full object-cover object-top" alt="Speaker" />
                      </div>
                      <div className="flex-1 h-full bg-gradient-to-br from-[#14121c]/98 to-[#1e1928]/95 border-2 border-[#d4b3ff] rounded-xl p-6 pl-12 flex flex-col shadow-2xl relative">
                         <div className="font-sans text-[#ff9ec4] text-xl font-bold tracking-[3px] mb-2 drop-shadow-[0_0_10px_#ff9ec4]">
                            DANIELLA (INNER VOICE)
                         </div>
                         <div className="font-mono text-white text-base md:text-lg leading-relaxed whitespace-pre-wrap overflow-y-auto pr-2 text-shadow-sm">
                            {dialogue.text}
                         </div>

                         <div className="absolute bottom-[105%] right-0 flex flex-col gap-2 items-end z-[700] min-w-[300px]">
                            {dialogue.choices.map((c, i) => (
                               <button 
                                 key={i} onClick={c.action}
                                 className="bg-[#0f0c14]/95 border border-[#8afff7] text-[#8afff7] py-3 px-6 font-mono text-base cursor-pointer transition-all duration-300 w-full text-right shadow-lg border-l-4 hover:bg-[#8afff7] hover:text-black hover:-translate-x-2"
                               >
                                  {c.label}
                               </button>
                            ))}
                         </div>
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>

              {/* PAUSE MENU */}
              {isMenuOpen && !ending && (
                  <div className="absolute inset-0 z-[8000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                      <div className="flex flex-col gap-6 items-center border border-[#8afff7] p-12 bg-[#0d0a12]/90 shadow-[0_0_40px_rgba(138,255,247,0.2)]">
                          <h2 className="text-3xl font-cinzel text-[#8afff7] mb-4 tracking-[0.5em]">SYSTEM PAUSED</h2>
                          <button onClick={toggleMenu} className="flex items-center gap-3 px-8 py-3 bg-[#8afff7]/10 hover:bg-[#8afff7] hover:text-black border border-[#8afff7] text-[#8afff7] font-mono tracking-widest transition-all w-64 justify-center">
                              <Play size={18} /> RESUME
                          </button>
                          <button onClick={restartGame} className="flex items-center gap-3 px-8 py-3 bg-[#e6c288]/10 hover:bg-[#e6c288] hover:text-black border border-[#e6c288] text-[#e6c288] font-mono tracking-widest transition-all w-64 justify-center">
                              <RefreshCw size={18} /> RESTART SYSTEM
                          </button>
                          <button onClick={onBack} className="flex items-center gap-3 px-8 py-3 bg-[#ff9ec4]/10 hover:bg-[#ff9ec4] hover:text-black border border-[#ff9ec4] text-[#ff9ec4] font-mono tracking-widest transition-all w-64 justify-center">
                              <LogOut size={18} /> ABORT
                          </button>
                      </div>
                  </div>
              )}

              {/* ENDING SCREEN */}
              {ending && (
                 <div className="absolute inset-0 bg-[#08060c]/96 z-[9000] flex flex-col justify-center items-center text-center backdrop-blur-sm animate-in fade-in duration-500">
                    <h2 className="font-cinzel text-6xl mb-8 animate-pulse text-shadow-glow" style={{ color: ending.color }}>
                       {ending.title}
                    </h2>
                    <p className="font-mono text-xl text-[#ccc] max-w-3xl leading-loose whitespace-pre-wrap mb-12">
                       {ending.desc}
                    </p>
                    <div className="flex gap-6">
                        <button 
                           onClick={restartGame}
                           className="px-12 py-5 bg-transparent border border-white/30 text-white/70 font-sans text-lg tracking-[4px] hover:bg-white hover:text-black hover:border-white transition-all"
                        >
                           TRY AGAIN
                        </button>
                        <button 
                           onClick={onBack}
                           className="px-12 py-5 bg-[#9affdc]/5 border border-[#9affdc] text-[#9affdc] font-sans text-lg tracking-[4px] hover:bg-[#9affdc]/15 hover:shadow-[0_0_40px_rgba(154,255,220,0.3)] transition-all"
                        >
                           REBOOT UNIVERSE
                        </button>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        <div className="flex flex-col gap-6 items-center justify-center h-fit py-5">
           <button onClick={toggleMenu} className="w-[52px] h-[52px] border border-white/20 rotate-45 flex justify-center items-center text-[#8afff7] transition-all duration-300 backdrop-blur-sm hover:border-[#9affdc] hover:text-[#9affdc] hover:shadow-[0_0_25px_#9affdc] hover:rotate-[225deg]">
              <Pause className="-rotate-45 w-6 h-6 fill-current" />
           </button>
           <button onClick={onBack} className="w-[52px] h-[52px] border border-white/20 rotate-45 flex justify-center items-center text-[#ff9ec4] transition-all duration-300 backdrop-blur-sm hover:border-[#ff9ec4] hover:text-white hover:bg-[#ff9ec4] hover:shadow-[0_0_25px_#ff9ec4] hover:rotate-[225deg]">
              <LogOut className="-rotate-45 w-6 h-6" />
           </button>
        </div>

      </div>
    </motion.div>
  );
}