import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-indigo-200"></div>
      
      {/* Sun/Moon Glow */}
      <div className="absolute top-10 right-20 w-32 h-32 bg-yellow-100 rounded-full blur-[60px] opacity-50"></div>

      {/* 2. Distant Clouds (Very Slow) */}
      <div className="absolute top-0 left-0 w-[200%] h-full animate-parallax-slow opacity-80">
        <div className="absolute top-20 left-10 w-32 h-8 bg-white rounded-full blur-md"></div>
        <div className="absolute top-32 left-1/2 w-48 h-12 bg-white rounded-full blur-md"></div>
        <div className="absolute top-16 left-[80%] w-24 h-6 bg-white rounded-full blur-md"></div>
      </div>

      {/* 3. Distant Mountains (Static/Very Slow) */}
      <div className="absolute bottom-[120px] left-0 w-[120%] h-64 opacity-60 flex items-end animate-parallax-mountains">
         {/* CSS Mountains */}
         <div className="w-0 h-0 border-l-[100px] border-r-[100px] border-b-[200px] border-l-transparent border-r-transparent border-b-indigo-300/80"></div>
         <div className="w-0 h-0 border-l-[150px] border-r-[150px] border-b-[300px] border-l-transparent border-r-transparent border-b-indigo-400/80 -ml-20"></div>
         <div className="w-0 h-0 border-l-[80px] border-r-[80px] border-b-[160px] border-l-transparent border-r-transparent border-b-indigo-300/80 -ml-10"></div>
         <div className="w-0 h-0 border-l-[120px] border-r-[120px] border-b-[240px] border-l-transparent border-r-transparent border-b-indigo-400/80 -ml-20"></div>
         <div className="w-0 h-0 border-l-[150px] border-r-[150px] border-b-[300px] border-l-transparent border-r-transparent border-b-indigo-400/80 -ml-20"></div>
      </div>

      {/* 4. Mid-Ground Hills (Medium Speed) */}
      <div className="absolute bottom-[120px] left-0 w-[200%] h-32 animate-parallax-hills flex items-end opacity-80">
          <div className="w-[20vw] h-20 bg-emerald-300 rounded-t-full mx-[-2vw]"></div>
          <div className="w-[30vw] h-32 bg-emerald-400 rounded-t-full mx-[-2vw]"></div>
          <div className="w-[25vw] h-24 bg-emerald-300 rounded-t-full mx-[-2vw]"></div>
          <div className="w-[35vw] h-28 bg-emerald-400 rounded-t-full mx-[-2vw]"></div>
          <div className="w-[20vw] h-16 bg-emerald-300 rounded-t-full mx-[-2vw]"></div>
           <div className="w-[30vw] h-32 bg-emerald-400 rounded-t-full mx-[-2vw]"></div>
          <div className="w-[25vw] h-24 bg-emerald-300 rounded-t-full mx-[-2vw]"></div>
          <div className="w-[35vw] h-28 bg-emerald-400 rounded-t-full mx-[-2vw]"></div>
      </div>

      {/* 5. Foreground Bushes (Faster) */}
      <div className="absolute bottom-[120px] left-0 w-[200%] h-16 animate-parallax-bushes flex items-end opacity-90">
         {Array.from({ length: 20 }).map((_, i) => (
             <div key={i} className="w-16 h-16 bg-emerald-600 rounded-full -mr-8 shadow-inner"></div>
         ))}
      </div>
      
      <style>{`
        @keyframes moveLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-parallax-slow {
          animation: moveLeft 60s linear infinite;
        }
        .animate-parallax-mountains {
           animation: moveLeft 120s linear infinite;
        }
        .animate-parallax-hills {
          animation: moveLeft 30s linear infinite;
        }
        .animate-parallax-bushes {
          animation: moveLeft 15s linear infinite;
        }
      `}</style>
    </div>
  );
};