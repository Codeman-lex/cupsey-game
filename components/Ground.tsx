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
      className="absolute bottom-0 w-full z-30 overflow-hidden border-t-2 border-gray-600 shadow-2xl"
    >
      {/* Moon Surface / Tech Floor */}
      <div className="w-full h-full bg-[#1a1d26] relative">
        <div className="w-full h-2 bg-[#2c3140]"></div>
        
        {/* Moving Grid Pattern */}
        <div 
            className={`w-[200%] h-full absolute top-0 left-0 flex ${gameStatus === GameStatus.PLAYING ? 'animate-scroll-ground' : ''}`}
            style={{ 
                backgroundImage: `
                    linear-gradient(90deg, #2c3140 2px, transparent 2px),
                    linear-gradient(#2c3140 2px, transparent 2px)
                `,
                backgroundSize: '40px 40px',
                animationPlayState: gameStatus === GameStatus.PLAYING ? 'running' : 'paused'
            }}
        >
        </div>
        
        {/* "Volume" Bars at bottom */}
        <div className="absolute bottom-0 w-full h-1/2 flex items-end justify-around opacity-20">
            {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="w-2 bg-green-500" style={{height: `${Math.random() * 100}%`}}></div>
            ))}
        </div>
      </div>

       <style>{`
        @keyframes scroll-ground {
          from { transform: translateX(0); }
          to { transform: translateX(-40px); }
        }
        .animate-scroll-ground {
          animation: scroll-ground 0.15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ground;