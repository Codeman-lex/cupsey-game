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
        className="bg-green-500 border-2 border-black z-10"
      >
        {/* Pipe Cap */}
        <div className="absolute bottom-0 left-[-4px] w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-black"></div>
        {/* Highlight */}
        <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-30"></div>
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
        className="bg-green-500 border-2 border-black z-10"
      >
        {/* Pipe Cap */}
        <div className="absolute top-0 left-[-4px] w-[calc(100%+8px)] h-6 bg-green-500 border-2 border-black"></div>
         {/* Highlight */}
         <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-30"></div>
      </div>
    </>
  );
};

export default Pipe;