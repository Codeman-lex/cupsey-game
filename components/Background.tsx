import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0b0e14]">
      {/* 1. Deep Space Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14] via-[#131722] to-[#1e222d]"></div>
      
      {/* 2. Trading Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
            backgroundImage: `linear-gradient(#2a2e39 1px, transparent 1px), linear-gradient(90deg, #2a2e39 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      ></div>

      {/* 3. The Moon (Goal) */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gray-200 rounded-full blur-[1px] shadow-[0_0_50px_rgba(255,255,255,0.2)] opacity-80 overflow-hidden">
         <div className="absolute top-4 left-6 w-6 h-6 bg-gray-300 rounded-full opacity-50"></div>
         <div className="absolute bottom-8 right-8 w-10 h-10 bg-gray-300 rounded-full opacity-50"></div>
      </div>

      {/* 4. Floating Crypto Symbols (Parallax) */}
      <div className="absolute top-0 left-0 w-[200%] h-full animate-parallax-slow opacity-30">
          <div className="absolute top-1/4 left-20 text-6xl text-yellow-500 rotate-12 font-bold">₿</div>
          <div className="absolute top-1/3 left-[40%] text-5xl text-blue-500 -rotate-12 font-bold">Ξ</div>
          <div className="absolute top-2/3 left-[70%] text-4xl text-purple-500 rotate-45 font-bold">◎</div>
          <div className="absolute top-20 left-[80%] text-2xl text-green-500 font-mono">HIGHER</div>
      </div>

      {/* 5. Background "Green Candle" Chart Line */}
      <div className="absolute bottom-0 left-0 w-[200%] h-[50%] opacity-20 animate-parallax-chart">
         <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,500 L100,400 L200,450 L300,300 L400,350 L500,200 L600,250 L700,100 L800,150 L900,50 L1000,0 V500 H0 Z" fill="url(#grad1)" />
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'rgb(34, 197, 94)', stopOpacity:0.5}} />
                <stop offset="100%" style={{stopColor:'rgb(34, 197, 94)', stopOpacity:0}} />
                </linearGradient>
            </defs>
         </svg>
      </div>
      
      <style>{`
        @keyframes moveLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-parallax-slow {
          animation: moveLeft 40s linear infinite;
        }
        .animate-parallax-chart {
          animation: moveLeft 20s linear infinite;
        }
      `}</style>
    </div>
  );
};