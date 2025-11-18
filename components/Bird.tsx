
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
        transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        zIndex: 20,
      }}
    >
      {/* Cuspey Character Container - Centered */}
      <div className="relative w-full h-full">
        
        {/* Shadow underneath */}
        <div className="absolute -bottom-2 left-1 w-[90%] h-2 bg-black/20 rounded-full blur-[2px]"></div>

        {/* --- THE BODY (Green Onesie) --- */}
        {/* It sits lower than the head and is wider at the bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-[#4CAF50] rounded-[14px] border-2 border-[#2E7D32] shadow-inner z-10 flex justify-center">
             {/* Belly highlight */}
             <div className="w-[60%] h-[60%] bg-white/10 rounded-full mt-1 blur-[1px]"></div>
        </div>

        {/* Legs (Little Green Nubs) */}
        <div className="absolute bottom-[-2px] left-[25%] w-[10px] h-[10px] bg-[#4CAF50] rounded-full border-2 border-[#2E7D32] z-0"></div>
        <div className="absolute bottom-[-2px] right-[25%] w-[10px] h-[10px] bg-[#4CAF50] rounded-full border-2 border-[#2E7D32] z-0"></div>

        {/* --- THE HEAD (White & Round) --- */}
        {/* Head is large, takes up top 65% */}
        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-[95%] h-[70%] bg-[#FFF9F0] rounded-[50%] border-2 border-gray-300 z-20 shadow-sm overflow-hidden">
           {/* Forehead Shine */}
           <div className="absolute top-1 left-[20%] w-[40%] h-[30%] bg-white rounded-full blur-[2px] opacity-60"></div>
        </div>

        {/* --- FACE FEATURES (On top of head) --- */}
        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-[95%] h-[70%] z-30">
            {/* Left Eye - Tall Oval */}
            <div className="absolute top-[30%] left-[22%] w-[18%] h-[28%] bg-black rounded-[50%] rotate-[-5deg]">
                <div className="absolute top-[15%] right-[20%] w-[35%] h-[35%] bg-white rounded-full"></div>
            </div>
            
            {/* Right Eye - Tall Oval */}
            <div className="absolute top-[30%] right-[22%] w-[18%] h-[28%] bg-black rounded-[50%] rotate-[5deg]">
                 <div className="absolute top-[15%] right-[20%] w-[35%] h-[35%] bg-white rounded-full"></div>
            </div>

            {/* Cheeks - Pink & Round */}
            <div className="absolute top-[55%] left-[15%] w-[15%] h-[10%] bg-[#FF8A80] rounded-full opacity-60 blur-[0.5px]"></div>
            <div className="absolute top-[55%] right-[15%] w-[15%] h-[10%] bg-[#FF8A80] rounded-full opacity-60 blur-[0.5px]"></div>
            
            {/* Mouth - Small Smile */}
            <div className="absolute top-[58%] left-1/2 -translate-x-1/2 w-[15%] h-[10%] border-b-2 border-black/80 rounded-[50%]"></div>
        </div>

        {/* --- ARMS (The Pointing Hand) --- */}
        {/* Right Arm (Back) */}
        <div className="absolute top-[45%] right-[-2px] w-[14px] h-[14px] bg-[#4CAF50] rounded-full border-2 border-[#2E7D32] z-0"></div>
        
        {/* Left Arm (Front - Pointing Up!) */}
        {/* This mimics the image where he points up */}
        <div className="absolute top-[40%] left-[-6px] w-[16px] h-[22px] bg-[#4CAF50] rounded-full border-2 border-[#2E7D32] z-30 rotate-[-20deg] flex items-start justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
        {/* The Finger */}
        <div className="absolute top-[32%] left-[-8px] w-[8px] h-[14px] bg-[#4CAF50] rounded-full border-2 border-[#2E7D32] z-20 rotate-[-30deg]"></div>

      </div>
    </div>
  );
};

export default Bird;
