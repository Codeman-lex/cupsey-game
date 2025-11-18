import React from 'react';
import { BIRD_WIDTH, BIRD_HEIGHT, BIRD_X_POSITION } from '../constants';

interface BirdProps {
  y: number;
  rotation: number;
}

const Bird: React.FC<BirdProps> = ({ y, rotation }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: BIRD_X_POSITION,
        top: y,
        width: BIRD_WIDTH,
        height: BIRD_HEIGHT,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.1s',
        zIndex: 20,
      }}
    >
      {/* Cuspey Character Container */}
      <div className="relative w-full h-full">
        
        {/* Back Hand/Wing (Green) */}
        <div className="absolute top-[20px] -right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>

        {/* Body (Green Suit) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-green-500 rounded-b-xl rounded-t-md border-2 border-black"></div>
        
        {/* Head (White) */}
        <div className="absolute top-0 left-0 w-full h-[70%] bg-white rounded-full border-2 border-black z-10 shadow-sm"></div>
        
        {/* Face Container */}
        <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none">
            {/* Left Eye */}
            <div className="absolute top-[8px] left-[8px] w-3 h-4 bg-black rounded-full -rotate-6">
                <div className="absolute top-1 right-0.5 w-1 h-1 bg-white rounded-full"></div>
            </div>
            
            {/* Right Eye */}
            <div className="absolute top-[8px] right-[8px] w-3 h-4 bg-black rounded-full rotate-6">
                 <div className="absolute top-1 right-0.5 w-1 h-1 bg-white rounded-full"></div>
            </div>

            {/* Cheeks */}
            <div className="absolute top-[20px] left-[6px] w-2.5 h-1.5 bg-rose-300 rounded-full opacity-60"></div>
            <div className="absolute top-[20px] right-[6px] w-2.5 h-1.5 bg-rose-300 rounded-full opacity-60"></div>
            
            {/* Smile */}
            <div className="absolute top-[22px] left-1/2 -translate-x-1/2 w-2 h-1 border-b-2 border-black rounded-full"></div>
        </div>

        {/* Front Hand (Green) - pointing up/forward */}
        <div className="absolute top-[24px] -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black z-30"></div>

      </div>
    </div>
  );
};

export default Bird;