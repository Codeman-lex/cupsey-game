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
      className="absolute bottom-0 w-full z-30 overflow-hidden border-t-4 border-black bg-[#ded895]"
    >
      {/* Grass Top */}
      <div className="w-full h-4 bg-[#73bf2e] border-b-4 border-[#558c22]"></div>
      
      {/* Moving Stripes pattern */}
      <div 
        className={`w-[200%] h-full absolute top-4 left-0 flex ${gameStatus === GameStatus.PLAYING ? 'animate-scroll-ground' : ''}`}
        style={{ 
            backgroundImage: 'linear-gradient(135deg, #d0c874 25%, transparent 25%, transparent 50%, #d0c874 50%, #d0c874 75%, transparent 75%, transparent)',
            backgroundSize: '20px 20px',
            animationPlayState: gameStatus === GameStatus.PLAYING ? 'running' : 'paused'
        }}
      >
      </div>
       <style>{`
        @keyframes scroll-ground {
          from { transform: translateX(0); }
          to { transform: translateX(-20px); }
        }
        .animate-scroll-ground {
          animation: scroll-ground 0.1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ground;
