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

  // Shared class for the pipe body gradient
  const pipeBodyClass = "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-700 border-x-2 border-emerald-900";
  // Shared class for the pipe cap gradient
  const pipeCapClass = "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-700 border-2 border-emerald-900 shadow-md";

  return (
    <>
      {/* Top Pipe */}
      <div
        style={{
          position: 'absolute',
          left: data.x,
          top: 0,
          width: PIPE_WIDTH,
          height: data.topHeight,
        }}
        className={`z-10 ${pipeBodyClass}`}
      >
        {/* Shine Highlight */}
        <div className="absolute top-0 left-2 w-3 h-full bg-white opacity-20"></div>
        <div className="absolute top-0 right-1 w-1 h-full bg-black opacity-20"></div>

        {/* Pipe Cap (Bottom of top pipe) */}
        <div className={`absolute bottom-0 left-[-6px] w-[calc(100%+12px)] h-8 ${pipeCapClass} flex flex-col justify-center`}>
             <div className="w-full h-[1px] bg-emerald-800 opacity-30"></div>
             {/* Cap Shine */}
             <div className="absolute top-0 left-3 w-3 h-full bg-white opacity-20"></div>
        </div>
      </div>

      {/* Bottom Pipe */}
      <div
        style={{
          position: 'absolute',
          left: data.x,
          top: data.topHeight + PIPE_GAP,
          width: PIPE_WIDTH,
          height: bottomPipeHeight,
        }}
        className={`z-10 ${pipeBodyClass}`}
      >
        {/* Shine Highlight */}
        <div className="absolute top-0 left-2 w-3 h-full bg-white opacity-20"></div>
        <div className="absolute top-0 right-1 w-1 h-full bg-black opacity-20"></div>

        {/* Pipe Cap (Top of bottom pipe) */}
        <div className={`absolute top-0 left-[-6px] w-[calc(100%+12px)] h-8 ${pipeCapClass} flex flex-col justify-center`}>
            <div className="w-full h-[1px] bg-emerald-800 opacity-30"></div>
            {/* Cap Shine */}
            <div className="absolute top-0 left-3 w-3 h-full bg-white opacity-20"></div>
        </div>
      </div>
    </>
  );
};

export default Pipe;