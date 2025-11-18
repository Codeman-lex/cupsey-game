
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Background } from './components/Background';
import Bird from './components/Bird';
import Pipe from './components/Pipe';
import Ground from './components/Ground';
import { GameStatus, PipeData } from './types';
import {
  GRAVITY,
  JUMP_STRENGTH,
  PIPE_SPEED,
  PIPE_SPAWN_RATE,
  PIPE_WIDTH,
  PIPE_GAP,
  BIRD_WIDTH,
  BIRD_HEIGHT,
  BIRD_X_POSITION,
  GROUND_HEIGHT,
} from './constants';
import { getGameOverComment } from './services/geminiService';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  // Game State
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [birdY, setBirdY] = useState(300);
  const [birdRotation, setBirdRotation] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [aiComment, setAiComment] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [isFlash, setIsFlash] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Countdown State
  const [countdown, setCountdown] = useState(3);

  // Refs
  const birdYRef = useRef(300);
  const birdVelocityRef = useRef(0);
  const pipesRef = useRef<PipeData[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastPipeSpawnTimeRef = useRef(0);
  const scoreRef = useRef(0);
  
  const windowSizeRef = useRef({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [windowSize, setWindowSize] = useState(windowSizeRef.current);

  useEffect(() => {
    const handleResize = () => {
      const newSize = { width: window.innerWidth, height: window.innerHeight };
      setWindowSize(newSize);
      windowSizeRef.current = newSize;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Game Logic ---

  const spawnPipe = useCallback((currentTime: number) => {
    const { width, height } = windowSizeRef.current;
    const minPipeHeight = 50;
    const maxAvailableHeight = height - GROUND_HEIGHT - PIPE_GAP - minPipeHeight;
    const safeMaxHeight = Math.max(minPipeHeight, maxAvailableHeight);
    const topHeight = Math.floor(Math.random() * (safeMaxHeight - minPipeHeight + 1)) + minPipeHeight;

    const newPipe: PipeData = {
      id: currentTime,
      x: width,
      topHeight,
      passed: false,
    };

    pipesRef.current = [...pipesRef.current, newPipe];
  }, []);

  const checkCollision = useCallback(() => {
    const { height } = windowSizeRef.current;
    const birdTop = birdYRef.current;
    const birdBottom = birdYRef.current + BIRD_HEIGHT;
    const collisionPadding = 8; 
    const birdLeft = BIRD_X_POSITION + collisionPadding;
    const birdRight = BIRD_X_POSITION + BIRD_WIDTH - collisionPadding;

    if (birdBottom >= height - GROUND_HEIGHT) {
      return true;
    }

    if (birdTop < -BIRD_HEIGHT) {
         return true;
    }

    for (const pipe of pipesRef.current) {
      const pipeLeft = pipe.x + collisionPadding;
      const pipeRight = pipe.x + PIPE_WIDTH - collisionPadding;

      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        const pipeTopBottom = pipe.topHeight;
        const pipeBottomTop = pipe.topHeight + PIPE_GAP;

        if (birdTop < pipeTopBottom || birdBottom > pipeBottomTop) {
          return true;
        }
      }
    }

    return false;
  }, []);

  const gameOver = useCallback(async () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    audioService.playDie();
    audioService.stopMusic();

    setIsFlash(true);
    setTimeout(() => setIsFlash(false), 100);
    
    setGameStatus(GameStatus.GAME_OVER);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('clumsyBirdHighScore', scoreRef.current.toString());
    }

    setLoadingAi(true);
    const comment = await getGameOverComment(scoreRef.current);
    setAiComment(comment);
    setLoadingAi(false);

  }, [highScore]);

  // 1. Define the loop function (depends on gameStatus)
  const loop = useCallback((time: number) => {
    if (gameStatus !== GameStatus.PLAYING) return;

    birdVelocityRef.current += GRAVITY;
    birdYRef.current += birdVelocityRef.current;

    let rotation = 0;
    if (birdVelocityRef.current < 0) {
        rotation = -25;
    } 
    else if (birdVelocityRef.current > 0) {
        rotation = Math.min(birdVelocityRef.current * 4, 90);
    }
    
    if (time - lastPipeSpawnTimeRef.current > PIPE_SPAWN_RATE) {
      spawnPipe(time);
      lastPipeSpawnTimeRef.current = time;
    }

    pipesRef.current = pipesRef.current
      .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
      .filter(pipe => pipe.x + PIPE_WIDTH > -100);

    pipesRef.current.forEach(pipe => {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X_POSITION) {
        pipe.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
        audioService.playScore();
      }
    });

    if (checkCollision()) {
      setBirdY(birdYRef.current);
      setBirdRotation(90);
      gameOver();
      return;
    }

    setBirdY(birdYRef.current);
    setBirdRotation(rotation);
    setPipes(pipesRef.current);

    gameLoopRef.current = requestAnimationFrame(loop);
  }, [spawnPipe, checkCollision, gameOver, gameStatus]);

  // 2. Start the loop only when gameStatus changes to PLAYING
  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING) {
       lastPipeSpawnTimeRef.current = performance.now();
       gameLoopRef.current = requestAnimationFrame(loop);
    }
    return () => {
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
    };
  }, [gameStatus, loop]);

  // --- Countdown & Start Logic ---

  const startSequence = () => {
    setGameStatus(GameStatus.COUNTDOWN);
    setScore(0);
    setAiComment("");
    
    // Reset Game State
    const startY = windowSizeRef.current.height / 2;
    birdYRef.current = startY;
    birdVelocityRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    
    setBirdY(startY);
    setBirdRotation(0);
    setPipes([]);
    setJumpCount(0);
    
    setCountdown(3);
    audioService.playCountdown();
  };

  // 3. Handle Countdown Timer
  useEffect(() => {
    let timer: number;
    if (gameStatus === GameStatus.COUNTDOWN) {
      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            
            // TRANSITION TO PLAYING
            setGameStatus(GameStatus.PLAYING); // This will trigger the effect above to start the loop
            audioService.playGo();
            audioService.startMusic();
            
            // Initial little bump so they don't fall instantly
            birdVelocityRef.current = JUMP_STRENGTH * 0.6; 
            
            return 0;
          }
          audioService.playCountdown();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus]);

  const jump = useCallback(() => {
    if (gameStatus === GameStatus.PLAYING) {
      birdVelocityRef.current = JUMP_STRENGTH;
      audioService.playJump();
      setJumpCount(c => c + 1);
    } else if (gameStatus === GameStatus.START || gameStatus === GameStatus.GAME_OVER) {
         // If user presses Space on start screen, start the sequence
         if (!loadingAi) {
            startSequence();
         }
    }
  }, [gameStatus, loadingAi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleTouch = (e: TouchEvent) => {
        e.preventDefault();
        jump();
    };

    const handleMouseDown = (e: MouseEvent) => {
        if ((e.target as HTMLElement).tagName !== 'BUTTON') {
             jump();
        }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [jump]);

  useEffect(() => {
    const stored = localStorage.getItem('clumsyBirdHighScore');
    if (stored) setHighScore(parseInt(stored));
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      const muted = audioService.toggleMute();
      setIsMuted(muted);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden select-none font-vt323 bg-gray-900">
      <Background />

      {/* Mute Button */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white/20 transition-colors text-white border border-white/20"
      >
         {/* Using SVG icons for better look */}
         {isMuted ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
             </svg>
         ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
         )}
      </button>

      {/* Pipes */}
      {pipes.map(pipe => (
        <Pipe
          key={pipe.id}
          data={pipe}
          gameHeight={windowSize.height}
          groundHeight={GROUND_HEIGHT}
        />
      ))}

      <Bird 
        y={birdY} 
        rotation={birdRotation} 
        jumpCount={jumpCount} 
        isHovering={gameStatus === GameStatus.COUNTDOWN || gameStatus === GameStatus.START}
      />

      <Ground gameStatus={gameStatus} />

      {/* Flash Effect (Red flash for liquidation) */}
      {isFlash && <div className="absolute inset-0 bg-red-500 z-50 opacity-40 animate-fadeOut pointer-events-none"></div>}

      {/* Score HUD */}
      {gameStatus === GameStatus.PLAYING && (
        <div className="absolute top-10 w-full text-center z-40 pointer-events-none flex flex-col items-center">
            <span className="text-xs font-mono text-green-400 mb-1 tracking-widest opacity-80">PORTFOLIO VALUE</span>
            <span className="text-6xl font-bold text-green-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-mono">
                ${score}K
            </span>
        </div>
      )}

      {/* Countdown Overlay */}
      {gameStatus === GameStatus.COUNTDOWN && (
         <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-[2px]">
            <div key={countdown} className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.8)] animate-ping-slow font-mono">
                {countdown === 0 ? "LFG!!!" : countdown}
            </div>
         </div>
      )}

      {/* Start Screen */}
      {gameStatus === GameStatus.START && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1e222d] p-8 rounded-3xl border border-gray-700 shadow-[0_0_50px_rgba(0,255,100,0.2)] text-center max-w-md animate-float">
            <h1 className="text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm tracking-tighter leading-none">
                CLUMSY DEGEN
            </h1>
            <p className="text-xl text-gray-400 mb-6 font-sans">Dodging red candles to the moon 🚀</p>
            
            <div className="mb-8 relative inline-block">
               <div className="w-20 h-20 relative mx-auto animate-bounce">
                    <Bird y={0} rotation={-10} jumpCount={0} />
               </div>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); startSequence(); }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-3xl font-bold py-4 px-10 rounded-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] font-mono"
            >
              APE IN 🦍
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameStatus === GameStatus.GAME_OVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1e222d] p-6 rounded-3xl border border-red-900 shadow-[0_0_60px_rgba(220,38,38,0.3)] text-center w-[90%] max-w-sm relative">
            <h2 className="text-5xl font-bold mb-6 text-red-500 drop-shadow-sm tracking-wider font-mono">LIQUIDATED</h2>
            
            <div className="flex justify-between mb-6 bg-[#131722] p-4 rounded-xl border border-gray-800">
                <div className="flex flex-col items-center w-1/2">
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-widest font-sans">Bag Size</span>
                    <span className="text-4xl font-bold text-white drop-shadow-sm">${score}K</span>
                </div>
                 <div className="flex flex-col items-center border-l border-gray-700 pl-4 w-1/2">
                    <span className="text-yellow-500 text-xs uppercase font-bold tracking-widest font-sans">ATH</span>
                    <span className="text-4xl font-bold text-yellow-500 drop-shadow-sm">${highScore}K</span>
                </div>
            </div>

            {/* AI Comment Section */}
            <div className="mb-6 min-h-[100px] flex items-center justify-center bg-[#131722] rounded-xl p-4 border border-gray-700">
               {loadingAi ? (
                   <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-blue-400 text-xs font-bold font-sans animate-pulse">Checking Charts...</span>
                   </div>
               ) : (
                   <p className="text-lg text-gray-300 italic leading-snug font-serif">"{aiComment}"</p>
               )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); startSequence(); }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-2xl font-bold py-4 px-8 rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xl font-mono"
            >
              BUY THE DIP 📉
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fadeOut {
          animation: fadeOut 0.2s ease-out forwards;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 3s ease-in-out infinite;
        }
        @keyframes ping-slow {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-slow {
            animation: ping-slow 0.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .font-vt323 {
            font-family: 'VT323', monospace;
        }
      `}</style>
    </div>
  );
};

export default App;
