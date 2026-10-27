import React from 'react';

export function FilingCabinet({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Flat long shadow */}
        <polygon points="100,60 170,100 170,250 100,210" fill="#0E2247" opacity="0.14" />

        {/* 30-deg Isometric: Top face (#E8EEF5), Left face (#B8C2CF), Right face (#9AA5B5) */}
        {/* Top Face */}
        <polygon points="100,20 160,55 100,90 40,55" fill="#E8EEF5" />
        {/* Left Face */}
        <polygon points="40,55 100,90 100,240 40,205" fill="#B8C2CF" />
        {/* Right Face */}
        <polygon points="100,90 160,55 160,205 100,240" fill="#9AA5B5" />

        {/* 3 Drawers on Left Face */}
        {[0, 1, 2].map((i) => {
          const yOff = i * 48;
          return (
            <g key={i}>
              <polygon
                points={`44,${66 + yOff} 96,${96 + yOff} 96,${136 + yOff} 44,${106 + yOff}`}
                fill="#C9D3DF"
              />
              {/* Drawer Handle */}
              <polygon
                points={`66,${88 + yOff} 76,${94 + yOff} 76,${99 + yOff} 66,${93 + yOff}`}
                fill="#0E2247"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ShelfWithFolders({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shelf structure: 30-deg Isometric */}
        {/* Top */}
        <polygon points="100,20 170,60 100,100 30,60" fill="#D3DAE3" />
        {/* Left */}
        <polygon points="30,60 100,100 100,210 30,170" fill="#B8C2CF" />
        {/* Right */}
        <polygon points="100,100 170,60 170,170 100,210" fill="#9AA5B5" />

        {/* 4 Colored Folders sitting on shelf (#FFD43B, #F7A23B, #3B82DC, #2E9E6B) */}
        <polygon points="45,65 52,69 52,95 45,91" fill="#FFD43B" />
        <polygon points="55,71 62,75 62,101 55,97" fill="#F7A23B" />
        <polygon points="65,77 72,81 72,107 65,103" fill="#3B82DC" />
        <polygon points="75,83 82,87 82,113 75,109" fill="#2E9E6B" />
      </svg>
    </div>
  );
}

export function DeskLamp({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Light Cone gradient */}
        <polygon points="125,50 30,220 190,220" fill="url(#lampConeGradient)" opacity="0.35" />
        <defs>
          <linearGradient id="lampConeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD43B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD43B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Base */}
        <ellipse cx="60" cy="200" rx="30" ry="12" fill="#FFD43B" />
        {/* Arm */}
        <path d="M60 195 L65 110 L125 50" stroke="#E5B820" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Conical Shade */}
        <polygon points="105,35 145,55 125,85 85,65" fill="#FFD43B" />
        <ellipse cx="105" cy="75" rx="22" ry="10" fill="#FFFDF5" />
      </svg>
    </div>
  );
}
