
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
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [aiComment, setAiComment] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [isFlash, setIsFlash] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Refs for high-frequency updates loop
  const birdYRef = useRef(300);
  const birdVelocityRef = useRef(0);
  const pipesRef = useRef<PipeData[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastPipeSpawnTimeRef = useRef(0);
  const scoreRef = useRef(0);
  
  // Window Size Ref
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
    // Slightly forgive collision box for better feel
    const collisionPadding = 6; // More forgiving for the round shape
    const birdLeft = BIRD_X_POSITION + collisionPadding;
    const birdRight = BIRD_X_POSITION + BIRD_WIDTH - collisionPadding;

    // 1. Ground Collision
    if (birdBottom >= height - GROUND_HEIGHT) {
      return true;
    }

    // 2. Ceiling Collision
    if (birdTop < -BIRD_HEIGHT) {
         return true;
    }

    // 3. Pipe Collision
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

  const loop = useCallback((time: number) => {
    birdVelocityRef.current += GRAVITY;
    birdYRef.current += birdVelocityRef.current;

    // Rotation logic
    let rotation = 0;
    if (birdVelocityRef.current < 0) rotation = -25;
    else if (birdVelocityRef.current > 0) {
        rotation = Math.min(birdVelocityRef.current * 3, 90);
    }
    
    // Pipe Logic
    if (time - lastPipeSpawnTimeRef.current > PIPE_SPAWN_RATE) {
      spawnPipe(time);
      lastPipeSpawnTimeRef.current = time;
    }

    // Move Pipes
    pipesRef.current = pipesRef.current
      .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
      .filter(pipe => pipe.x + PIPE_WIDTH > -100);

    // Score Logic
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
  }, [spawnPipe, checkCollision, gameOver]);

  const startGame = () => {
    setGameStatus(GameStatus.PLAYING);
    setScore(0);
    setAiComment("");
    audioService.startMusic();
    
    const startY = windowSizeRef.current.height / 2;
    birdYRef.current = startY;
    birdVelocityRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    lastPipeSpawnTimeRef.current = performance.now();
    
    setBirdY(startY);
    setBirdRotation(0);
    setPipes([]);

    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = requestAnimationFrame(loop);
    
    // Initial jump
    jump();
  };

  const jump = useCallback(() => {
    if (gameStatus === GameStatus.PLAYING) {
      birdVelocityRef.current = JUMP_STRENGTH;
      audioService.playJump();
    } else if (gameStatus !== GameStatus.PLAYING && !loadingAi) {
        if (gameStatus === GameStatus.GAME_OVER) {
             startGame();
        } else if (gameStatus === GameStatus.START) {
            startGame();
        }
    }
  }, [gameStatus, loadingAi, loop]);

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
    <div className="relative w-full h-screen overflow-hidden select-none font-vt323">
      <Background />

      {/* Mute Button */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors"
      >
          {isMuted ? "🔇" : "🔊"}
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

      {/* Bird */}
      <Bird y={birdY} rotation={birdRotation} />

      {/* Ground */}
      <Ground gameStatus={gameStatus} />

      {/* Flash Effect */}
      {isFlash && <div className="absolute inset-0 bg-white z-50 opacity-60 animate-fadeOut pointer-events-none"></div>}

      {/* Score HUD */}
      {gameStatus === GameStatus.PLAYING && (
        <div className="absolute top-10 w-full text-center z-40 pointer-events-none">
          <span className="text-7xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-mono stroke-black stroke-2">
            {score}
          </span>
        </div>
      )}

      {/* Start Screen */}
      {gameStatus === GameStatus.START && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl border-4 border-emerald-500 shadow-[0_0_40px_rgba(0,0,0,0.2)] text-center max-w-md animate-float">
            <h1 className="text-6xl font-bold mb-2 text-emerald-600 drop-shadow-sm tracking-wide leading-none">CLUMSY CUSPEY</h1>
            <p className="text-xl text-gray-500 mb-6 font-sans">Tap, click, or spacebar to fly!</p>
            
            <div className="mb-8 relative inline-block">
               {/* Preview Bird */}
               <div className="w-20 h-20 relative mx-auto animate-bounce">
                    <Bird y={0} rotation={-10} />
               </div>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-3xl font-bold py-4 px-10 rounded-2xl border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 transition-all shadow-xl"
            >
              START GAME
            </button>
            <div className="mt-4 text-sm text-gray-400 font-sans">Sound will play on start 🔊</div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameStatus === GameStatus.GAME_OVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#fff8e1] p-6 rounded-3xl border-4 border-orange-500 shadow-2xl text-center w-[90%] max-w-sm relative">
            <h2 className="text-5xl font-bold mb-6 text-orange-500 drop-shadow-sm tracking-wider">GAME OVER</h2>
            
            <div className="flex justify-between mb-6 bg-orange-100 p-4 rounded-xl border-2 border-orange-200 shadow-inner">
                <div className="flex flex-col items-center w-1/2">
                    <span className="text-orange-400 text-lg uppercase font-bold tracking-widest font-sans">Score</span>
                    <span className="text-5xl font-bold text-orange-600 drop-shadow-sm">{score}</span>
                </div>
                 <div className="flex flex-col items-center border-l-2 border-orange-200 pl-4 w-1/2">
                    <span className="text-orange-400 text-lg uppercase font-bold tracking-widest font-sans">Best</span>
                    <span className="text-5xl font-bold text-orange-600 drop-shadow-sm">{highScore}</span>
                </div>
            </div>

            {/* AI Comment Section */}
            <div className="mb-6 min-h-[90px] flex items-center justify-center bg-white rounded-xl p-4 border-2 border-gray-100 shadow-sm">
               {loadingAi ? (
                   <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-orange-400 text-sm font-bold font-sans">Consulting the judges...</span>
                   </div>
               ) : (
                   <p className="text-xl text-gray-700 italic leading-tight font-serif">"{aiComment}"</p>
               )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="w-full bg-sky-400 hover:bg-sky-300 text-white text-2xl font-bold py-4 px-8 rounded-2xl border-b-8 border-sky-600 active:border-b-0 active:translate-y-2 transition-all shadow-xl"
            >
              TRY AGAIN
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
        .font-vt323 {
            font-family: 'VT323', monospace;
        }
      `}</style>
    </div>
  );
};

export default App;
