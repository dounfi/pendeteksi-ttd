import React from 'react';

export function Keyboard({ className = '' }: { className?: string }) {
  // Generate 5 rows of keys
  const rows = [
    { count: 14, width: 38 },
    { count: 14, width: 38 },
    { count: 13, width: 38 },
    { count: 12, width: 38 },
  ];

  return (
    <div className={`inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 700 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        {/* Flat long shadow */}
        <rect x="20" y="20" width="670" height="260" rx="24" fill="#0E2247" opacity="0.14" />

        {/* Keyboard Chassis: Light edge, base #F4F6F9, shadow #C9D1DC */}
        <rect x="10" y="10" width="670" height="260" rx="24" fill="#F4F6F9" />
        <path d="M34 10 H656 C669 10 680 21 680 34 V38 C680 25 669 14 656 14 H34 C21 14 10 25 10 38 V34 C10 21 21 10 34 10 Z" fill="#FFFFFF" />
        <path d="M10 246 C10 259 21 270 34 270 H656 C669 270 680 259 680 246 V242 C680 255 669 266 656 266 H34 C21 266 10 255 10 242 Z" fill="#C9D1DC" />

        {/* Inner Keyboard Bed */}
        <rect x="28" y="28" width="634" height="224" rx="14" fill="#E2E8F0" />

        {/* Keys grid (5 rows) */}
        {rows.map((row, rIdx) => {
          const y = 38 + rIdx * 42;
          return Array.from({ length: row.count }).map((_, cIdx) => {
            const x = 38 + cIdx * 44;
            return (
              <g key={`${rIdx}-${cIdx}`}>
                <rect x={x} y={y} width="38" height="36" rx="6" fill="#1B2A4A" />
                <rect x={x} y={y} width="38" height="6" rx="3" fill="#2E4470" />
              </g>
            );
          });
        })}

        {/* Row 5: Modifiers and long Spacebar */}
        <g>
          {/* Ctrl, Alt, Win */}
          <rect x="38" y="206" width="46" height="36" rx="6" fill="#1B2A4A" />
          <rect x="38" y="206" width="46" height="6" rx="3" fill="#2E4470" />
          <rect x="90" y="206" width="46" height="36" rx="6" fill="#1B2A4A" />
          <rect x="90" y="206" width="46" height="6" rx="3" fill="#2E4470" />

          {/* Long Spacebar */}
          <rect x="144" y="206" width="310" height="36" rx="6" fill="#1B2A4A" />
          <rect x="144" y="206" width="310" height="6" rx="3" fill="#2E4470" />

          {/* Right modifiers */}
          <rect x="462" y="206" width="46" height="36" rx="6" fill="#1B2A4A" />
          <rect x="462" y="206" width="46" height="6" rx="3" fill="#2E4470" />
          <rect x="514" y="206" width="46" height="36" rx="6" fill="#1B2A4A" />
          <rect x="514" y="206" width="46" height="6" rx="3" fill="#2E4470" />
          <rect x="566" y="206" width="86" height="36" rx="6" fill="#1B2A4A" />
          <rect x="566" y="206" width="86" height="6" rx="3" fill="#2E4470" />
        </g>
      </svg>
    </div>
  );
}

export function Mouse({ className = '', animated = true }: { className?: string; animated?: boolean }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block overflow-visible"
      >
        {/* Curving Cable looping out to left */}
        <path
          d="M190 70 C190 20, 60 10, 40 50 C20 90, 80 140, 40 180 C0 220, 30 290, 10 310"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          className={animated ? 'animate-pulse' : ''}
        />

        {/* Flat long shadow of mouse */}
        <rect x="130" y="80" width="130" height="210" rx="65" fill="#0E2247" opacity="0.14" />

        {/* Mouse body (white capsule r65: light top, base #F4F6F9, shadow #C9D1DC) */}
        <rect x="120" y="70" width="130" height="210" rx="65" fill="#F4F6F9" />
        {/* Highlight curve */}
        <path d="M185 70 C150 70 120 100 120 135 C120 105 145 74 185 74 C225 74 250 105 250 135 C250 100 220 70 185 70 Z" fill="#FFFFFF" />
        {/* Shadow bottom */}
        <path d="M120 215 C120 250 150 280 185 280 C220 280 250 250 250 215 C250 246 220 276 185 276 C150 276 120 246 120 215 Z" fill="#C9D1DC" />

        {/* Center seam */}
        <line x1="185" y1="70" x2="185" y2="150" stroke="#CBD5E1" strokeWidth="2" />

        {/* Scroll wheel pill (Navy #14346B) */}
        <rect x="177" y="100" width="16" height="34" rx="8" fill="#14346B" />
        <rect x="180" y="104" width="10" height="8" rx="4" fill="#2E4470" />
      </svg>
    </div>
  );
}
