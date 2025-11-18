import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Sky */}
      <div className="absolute inset-0 bg-sky-300"></div>
      
      {/* Clouds */}
      <div className="absolute top-20 left-10 w-24 h-12 bg-white rounded-full opacity-60 animate-[moveLeft_20s_linear_infinite]"></div>
      <div className="absolute top-40 left-1/2 w-32 h-16 bg-white rounded-full opacity-60 animate-[moveLeft_25s_linear_infinite]"></div>
      <div className="absolute top-10 left-3/4 w-20 h-10 bg-white rounded-full opacity-40 animate-[moveLeft_30s_linear_infinite]"></div>

      {/* Cityscape Silhouette (CSS Art) */}
      <div className="absolute bottom-[112px] left-0 w-full h-32 opacity-30 flex items-end">
          <div className="w-10 h-16 bg-emerald-800 mx-1"></div>
          <div className="w-14 h-24 bg-emerald-800 mx-1"></div>
          <div className="w-8 h-12 bg-emerald-800 mx-1"></div>
          <div className="w-20 h-20 bg-emerald-800 mx-1"></div>
          <div className="w-12 h-28 bg-emerald-800 mx-1"></div>
          <div className="w-16 h-14 bg-emerald-800 mx-1"></div>
          <div className="w-24 h-20 bg-emerald-800 mx-1"></div>
          <div className="w-10 h-16 bg-emerald-800 mx-1"></div>
          <div className="w-14 h-24 bg-emerald-800 mx-1"></div>
          <div className="w-8 h-12 bg-emerald-800 mx-1"></div>
          <div className="w-20 h-20 bg-emerald-800 mx-1"></div>
          <div className="w-12 h-28 bg-emerald-800 mx-1"></div>
          <div className="w-16 h-14 bg-emerald-800 mx-1"></div>
          <div className="w-24 h-20 bg-emerald-800 mx-1"></div>
           <div className="w-10 h-16 bg-emerald-800 mx-1"></div>
          <div className="w-14 h-24 bg-emerald-800 mx-1"></div>
          <div className="w-8 h-12 bg-emerald-800 mx-1"></div>
          <div className="w-20 h-20 bg-emerald-800 mx-1"></div>
      </div>
      
      <style>{`
        @keyframes moveLeft {
          from { transform: translateX(100vw); }
          to { transform: translateX(-20vw); }
        }
      `}</style>
    </div>
  );
};
