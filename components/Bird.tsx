import React, { useEffect, useState } from 'react';
import { BIRD_WIDTH, BIRD_HEIGHT, BIRD_X_POSITION } from '../constants';

interface BirdProps {
  y: number;
  rotation: number;
  jumpCount: number;
  isHovering?: boolean; // New prop for countdown state
}

const Bird: React.FC<BirdProps> = ({ y, rotation, jumpCount, isHovering = false }) => {
  const [isSomersaulting, setIsSomersaulting] = useState(false);

  useEffect(() => {
    if (jumpCount > 0) {
      setIsSomersaulting(true);
      const timer = setTimeout(() => setIsSomersaulting(false), 600);
      return () => clearTimeout(timer);
    }
  }, [jumpCount]);

  return (
    <div
      style={{
        position: 'absolute',
        left: BIRD_X_POSITION,
        top: y,
        width: BIRD_WIDTH,
        height: BIRD_HEIGHT,
        zIndex: 20,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
      className={isHovering ? 'animate-hover' : ''}
    >
        {/* Rocket Flame (Appears behind him) */}
        <div className="absolute top-[60%] left-[-15px] w-8 h-8 z-0 rotate-90 origin-right opacity-80">
             <div className="w-full h-full bg-orange-500 rounded-full blur-[4px] animate-pulse"></div>
             <div className="absolute top-1 left-1 w-4 h-4 bg-yellow-300 rounded-full blur-[2px]"></div>
        </div>

      {/* Somersault Container */}
      <div 
        className={`w-full h-full relative z-10 ${isSomersaulting ? 'animate-somersault' : ''}`}
      >
        {/* --- CUSPEY CHARACTER DESIGN --- */}
        
        {/* Body (Green Suit) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-[55%] bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-2xl shadow-inner z-10 flex justify-center items-center border-[1.5px] border-[#1b5e20]">
             {/* Belly shine */}
             <div className="w-[60%] h-[50%] bg-white/20 rounded-full mb-1 blur-[1px]"></div>
        </div>

        {/* Legs */}
        <div className="absolute bottom-[-4px] left-[25%] w-[12px] h-[12px] bg-[#388E3C] rounded-full border border-[#1b5e20] z-0"></div>
        <div className="absolute bottom-[-4px] right-[25%] w-[12px] h-[12px] bg-[#388E3C] rounded-full border border-[#1b5e20] z-0"></div>

        {/* Head (White & Round) */}
        <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-[100%] h-[75%] bg-gradient-to-b from-white to-[#f0f0f0] rounded-full border-[1.5px] border-gray-300 z-20 shadow-[0_2px_5px_rgba(0,0,0,0.1)] overflow-hidden">
           {/* 3D Sphere Highlight */}
           <div className="absolute top-2 left-[20%] w-[40%] h-[30%] bg-white rounded-full blur-[3px] opacity-90"></div>
        </div>

        {/* Face Layer */}
        <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-[100%] h-[75%] z-30">
            {/* Left Eye */}
            <div className="absolute top-[35%] left-[20%] w-[22%] h-[32%] bg-black rounded-full rotate-[-5deg]">
                <div className="absolute top-[20%] right-[20%] w-[35%] h-[35%] bg-white rounded-full shadow-[0_0_2px_white]"></div>
                <div className="absolute bottom-[15%] left-[25%] w-[15%] h-[15%] bg-white/50 rounded-full"></div>
            </div>
            
            {/* Right Eye */}
            <div className="absolute top-[35%] right-[20%] w-[22%] h-[32%] bg-black rounded-full rotate-[5deg]">
                 <div className="absolute top-[20%] right-[20%] w-[35%] h-[35%] bg-white rounded-full shadow-[0_0_2px_white]"></div>
                 <div className="absolute bottom-[15%] left-[25%] w-[15%] h-[15%] bg-white/50 rounded-full"></div>
            </div>

            {/* Pink Cheeks */}
            <div className="absolute top-[65%] left-[12%] w-[18%] h-[12%] bg-[#FF8A80] rounded-full opacity-70 blur-[1px]"></div>
            <div className="absolute top-[65%] right-[12%] w-[18%] h-[12%] bg-[#FF8A80] rounded-full opacity-70 blur-[1px]"></div>
            
            {/* Mouth */}
            <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[12%] h-[6%] border-b-[2.5px] border-black/80 rounded-full"></div>
        </div>

        {/* Front Pointing Hand */}
        <div className="absolute top-[45%] left-[-8px] z-30">
            <div className="w-[16px] h-[16px] bg-[#4CAF50] rounded-full border border-[#1b5e20]"></div>
            <div className="absolute -top-[8px] left-[2px] w-[10px] h-[16px] bg-[#4CAF50] rounded-full border border-[#1b5e20] rotate-[-15deg] flex items-center justify-center">
                 <div className="w-[6px] h-[8px] bg-white/20 rounded-full mt-1"></div>
            </div>
        </div>

      </div>
      <style>{`
        @keyframes somersault {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-somersault {
          animation: somersault 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        @keyframes hover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-hover {
          animation: hover 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Bird;