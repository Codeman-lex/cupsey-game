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

  // Refs for high-frequency updates loop
  const birdYRef = useRef(300);
  const birdVelocityRef = useRef(0);
  const pipesRef = useRef<PipeData[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastPipeSpawnTimeRef = useRef(0);
  const scoreRef = useRef(0);
  
  // Window Size Ref to prevent stale closures in game loop
  const windowSizeRef = useRef({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Dimensions State for Rendering
  const [windowSize, setWindowSize] = useState(windowSizeRef.current);

  useEffect(() => {
    const handleResize = () => {
      const newSize = { width: window.innerWidth, height: window.innerHeight };
      setWindowSize(newSize);
      windowSizeRef.current = newSize; // Update ref for game loop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Game Logic ---

  const spawnPipe = useCallback((currentTime: number) => {
    // Use ref to get latest dimensions without restarting loop
    const { width, height } = windowSizeRef.current;
    
    const minPipeHeight = 50;
    // Ensure maxPipeHeight is positive even on small screens
    const maxAvailableHeight = height - GROUND_HEIGHT - PIPE_GAP - minPipeHeight;
    const safeMaxHeight = Math.max(minPipeHeight, maxAvailableHeight);
    
    // Clamp random height
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
    const birdLeft = BIRD_X_POSITION;
    const birdRight = BIRD_X_POSITION + BIRD_WIDTH;

    // 1. Ground Collision
    if (birdBottom >= height - GROUND_HEIGHT) {
      return true;
    }

    // 2. Ceiling Collision (prevent flying over pipes indefinitely)
    if (birdTop < -BIRD_HEIGHT) {
         return true;
    }

    // 3. Pipe Collision
    for (const pipe of pipesRef.current) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Check if bird is within horizontal pipe area
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        const pipeTopBottom = pipe.topHeight;
        const pipeBottomTop = pipe.topHeight + PIPE_GAP;

        // Check vertical collision (hit top pipe OR hit bottom pipe)
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
    setIsFlash(true);
    setTimeout(() => setIsFlash(false), 100);
    
    setGameStatus(GameStatus.GAME_OVER);

    // Save High Score
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('clumsyBirdHighScore', scoreRef.current.toString());
    }

    // Fetch AI Comment
    setLoadingAi(true);
    const comment = await getGameOverComment(scoreRef.current);
    setAiComment(comment);
    setLoadingAi(false);

  }, [highScore]);

  const loop = useCallback((time: number) => {
    // Note: gameStatus check here is redundant if we cancel RAF on Game Over,
    // but good for safety.
    // We rely on the fact that this function is recreated on state change, 
    // BUT we primarily rely on cancelAnimationFrame to stop the old loop.
    
    // Physics Update
    birdVelocityRef.current += GRAVITY;
    birdYRef.current += birdVelocityRef.current;

    // Rotation logic
    let rotation = 0;
    if (birdVelocityRef.current < 0) rotation = -25;
    else if (birdVelocityRef.current > 0) {
        rotation = Math.min(birdVelocityRef.current * 4, 90);
    }
    
    // Pipe Logic
    if (time - lastPipeSpawnTimeRef.current > PIPE_SPAWN_RATE) {
      spawnPipe(time);
      lastPipeSpawnTimeRef.current = time;
    }

    // Move Pipes
    pipesRef.current = pipesRef.current
      .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
      .filter(pipe => pipe.x + PIPE_WIDTH > -100); // Cleanup pipes well off screen

    // Score Logic
    pipesRef.current.forEach(pipe => {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X_POSITION) {
        pipe.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current); // Sync to React state for UI
      }
    });

    // Collision Detection
    if (checkCollision()) {
      // Render one last frame at crash position
      setBirdY(birdYRef.current);
      setBirdRotation(90); // Nose dive
      gameOver();
      return;
    }

    // Sync refs to state for render
    setBirdY(birdYRef.current);
    setBirdRotation(rotation);
    setPipes(pipesRef.current);

    gameLoopRef.current = requestAnimationFrame(loop);
  }, [spawnPipe, checkCollision, gameOver]);

  // Start Game
  const startGame = () => {
    setGameStatus(GameStatus.PLAYING);
    setScore(0);
    setAiComment("");
    
    // Reset Refs
    const startY = windowSizeRef.current.height / 2;
    birdYRef.current = startY;
    birdVelocityRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    lastPipeSpawnTimeRef.current = performance.now();
    
    // Reset State
    setBirdY(startY);
    setBirdRotation(0);
    setPipes([]);

    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = requestAnimationFrame(loop);
  };

  // User Input
  const jump = useCallback(() => {
    if (gameStatus === GameStatus.PLAYING) {
      birdVelocityRef.current = JUMP_STRENGTH;
    } else if (gameStatus !== GameStatus.PLAYING && !loadingAi) {
        // Delay restart slightly to prevent accidental double taps
        if (gameStatus === GameStatus.GAME_OVER) {
             startGame();
        } else if (gameStatus === GameStatus.START) {
            startGame();
        }
    }
  }, [gameStatus, loadingAi, loop]);

  // Controls Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleTouch = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
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

  // Load High Score
  useEffect(() => {
    const stored = localStorage.getItem('clumsyBirdHighScore');
    if (stored) setHighScore(parseInt(stored));
  }, []);


  return (
    <div className="relative w-full h-screen overflow-hidden select-none font-vt323">
      <Background />

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
      {isFlash && <div className="absolute inset-0 bg-white z-50 opacity-80 animate-fadeOut pointer-events-none"></div>}

      {/* Score HUD */}
      {gameStatus === GameStatus.PLAYING && (
        <div className="absolute top-10 w-full text-center z-40 pointer-events-none">
          <span className="text-6xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-mono">
            {score}
          </span>
        </div>
      )}

      {/* Start Screen */}
      {gameStatus === GameStatus.START && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 p-8 rounded-xl border-4 border-black shadow-2xl text-center max-w-md">
            <h1 className="text-6xl font-bold mb-4 text-sky-600 drop-shadow-md tracking-wide leading-none">CLUMSY CUSPEY</h1>
            <div className="mb-6">
                <p className="text-2xl mb-4 text-gray-700">Help Cuspey Fly!</p>
                {/* Cuspey Icon */}
                <div className="inline-block animate-bounce mt-2">
                   <div className="w-16 h-16 relative mx-auto">
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-green-500 rounded-b-xl rounded-t-md border-2 border-black"></div>
                       <div className="absolute top-0 left-0 w-full h-[70%] bg-white rounded-full border-2 border-black z-10"></div>
                       <div className="absolute top-[10px] left-[10px] w-3 h-4 bg-black rounded-full -rotate-6 z-20"><div className="absolute top-1 right-0.5 w-1 h-1 bg-white rounded-full"></div></div>
                       <div className="absolute top-[10px] right-[10px] w-3 h-4 bg-black rounded-full rotate-6 z-20"><div className="absolute top-1 right-0.5 w-1 h-1 bg-white rounded-full"></div></div>
                       <div className="absolute top-[28px] left-1/2 -translate-x-1/2 w-2 h-1 border-b-2 border-black rounded-full z-20"></div>
                   </div>
                </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="bg-green-500 hover:bg-green-600 text-white text-3xl font-bold py-3 px-10 rounded border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
            >
              START
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameStatus === GameStatus.GAME_OVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#ded895] p-6 rounded-lg border-4 border-orange-600 shadow-2xl text-center w-[90%] max-w-sm relative">
            <h2 className="text-5xl font-bold mb-6 text-orange-600 drop-shadow-sm tracking-wider">GAME OVER</h2>
            
            <div className="flex justify-between mb-6 bg-[#cbb968] p-4 rounded border-2 border-[#a49246] shadow-inner">
                <div className="flex flex-col items-center w-1/2">
                    <span className="text-orange-800 text-lg uppercase font-bold tracking-widest">Score</span>
                    <span className="text-4xl font-bold text-white drop-shadow-md">{score}</span>
                </div>
                 <div className="flex flex-col items-center border-l-2 border-[#a49246] pl-4 w-1/2">
                    <span className="text-orange-800 text-lg uppercase font-bold tracking-widest">Best</span>
                    <span className="text-4xl font-bold text-white drop-shadow-md">{highScore}</span>
                </div>
            </div>

            {/* AI Comment Section */}
            <div className="mb-6 min-h-[80px] flex items-center justify-center bg-white/20 rounded p-2 border border-[#a49246]/30">
               {loadingAi ? (
                   <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-orange-800 text-sm font-bold">Cuspey is thinking...</span>
                   </div>
               ) : (
                   <p className="text-xl text-black italic leading-tight font-serif">"{aiComment}"</p>
               )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="bg-sky-400 hover:bg-sky-500 text-white text-2xl font-bold py-3 px-8 rounded border-b-4 border-sky-600 active:border-b-0 active:translate-y-1 transition-all w-full shadow-lg"
            >
              PLAY AGAIN
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
        .font-vt323 {
            font-family: 'VT323', monospace;
        }
      `}</style>
    </div>
  );
};

export default App;