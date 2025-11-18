import React from 'react';
import { GameStatus } from '../types';
import { GROUND_HEIGHT } from '../constants';

interface GroundProps {
  gameStatus: GameStatus;
}

const Ground: React.FC<GroundProps> = ({ gameStatus }) => {
  return (
    <div
      style={{ height: GROUND_HEIGHT }}
      className="absolute bottom-0 w-full z-30 overflow-hidden border-t-4 border-[#4e3c28] shadow-2xl"
    >
      {/* Detailed Grass Top */}
      <div className="w-full h-6 bg-gradient-to-b from-[#73bf2e] to-[#558c22] relative">
         <div className="absolute bottom-0 w-full h-2 border-b-2 border-[#3a5e16] opacity-40"></div>
      </div>
      
      {/* Dirt Section */}
      <div className="w-full h-full bg-[#ded895] relative">
        {/* Moving Pattern */}
        <div 
            className={`w-[200%] h-full absolute top-0 left-0 flex ${gameStatus === GameStatus.PLAYING ? 'animate-scroll-ground' : ''}`}
            style={{ 
                backgroundImage: `
                    linear-gradient(45deg, #cbb968 25%, transparent 25%, transparent 75%, #cbb968 75%, #cbb968), 
                    linear-gradient(45deg, #cbb968 25%, transparent 25%, transparent 75%, #cbb968 75%, #cbb968)
                `,
                backgroundColor: '#dcd086',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px',
                animationPlayState: gameStatus === GameStatus.PLAYING ? 'running' : 'paused'
            }}
        >
        </div>
        
        {/* Dirt Details / Shadows */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
      </div>

       <style>{`
        @keyframes scroll-ground {
          from { transform: translateX(0); }
          to { transform: translateX(-20px); }
        }
        .animate-scroll-ground {
          animation: scroll-ground 0.15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ground;