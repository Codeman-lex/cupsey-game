import React from 'react';
import { PIPE_WIDTH, PIPE_GAP } from '../constants';
import { PipeData } from '../types';

interface PipeProps {
  data: PipeData;
  gameHeight: number;
  groundHeight: number;
}

const Pipe: React.FC<PipeProps> = ({ data, gameHeight, groundHeight }) => {
  const bottomPipeHeight = gameHeight - groundHeight - data.topHeight - PIPE_GAP;

  // Candle Body Styling (Bearish Red)
  const candleBodyClass = "bg-red-500 border-2 border-red-700 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
  // Wick Styling
  const wickClass = "absolute left-1/2 -translate-x-1/2 w-1 bg-red-400";

  return (
    <>
      {/* --- TOP OBSTACLE (Top Wick + Body) --- */}
      <div
        style={{
          position: 'absolute',
          left: data.x,
          top: 0,
          width: PIPE_WIDTH,
          height: data.topHeight,
        }}
        className="z-10 flex flex-col justify-end items-center"
      >
        {/* The Wick extending down from the body */}
        <div className={`h-[100vh] -top-[calc(100vh-10px)] ${wickClass}`}></div>
        
        {/* The Candle Body */}
        <div className={`w-full h-full relative ${candleBodyClass} rounded-b-sm`}>
             {/* Glossy reflection */}
             <div className="absolute top-0 right-1 w-2 h-full bg-red-900 opacity-20"></div>
             <div className="absolute top-2 left-2 w-1 h-[90%] bg-white opacity-20 rounded-full"></div>
             
             {/* Price Label (Fake data) */}
             <div className="absolute bottom-2 w-full text-center text-[10px] text-red-900 font-mono font-bold opacity-60">
                SELL
             </div>
        </div>
        
        {/* Bottom Wick Stick out slightly */}
        <div className={`h-6 -bottom-6 ${wickClass}`}></div>
      </div>

      {/* --- BOTTOM OBSTACLE (Body + Bottom Wick) --- */}
      <div
        style={{
          position: 'absolute',
          left: data.x,
          top: data.topHeight + PIPE_GAP,
          width: PIPE_WIDTH,
          height: bottomPipeHeight,
        }}
        className="z-10 flex flex-col justify-start items-center"
      >
        {/* Top Wick Stick out slightly */}
        <div className={`h-6 -top-6 ${wickClass}`}></div>

        {/* The Candle Body */}
        <div className={`w-full h-full relative ${candleBodyClass} rounded-t-sm`}>
            {/* Glossy reflection */}
            <div className="absolute top-0 right-1 w-2 h-full bg-red-900 opacity-20"></div>
            <div className="absolute top-2 left-2 w-1 h-[90%] bg-white opacity-20 rounded-full"></div>
            
             <div className="absolute top-2 w-full text-center text-[10px] text-red-900 font-mono font-bold opacity-60">
                REKT
             </div>
        </div>

        {/* The Wick extending down */}
        <div className={`h-[100vh] -bottom-[calc(100vh-10px)] ${wickClass}`}></div>
      </div>
    </>
  );
};

export default Pipe;