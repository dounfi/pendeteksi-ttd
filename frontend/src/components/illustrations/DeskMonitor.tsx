import React from 'react';

interface DeskMonitorProps {
  className?: string;
  children?: React.ReactNode;
}

export function DeskMonitor({ className = '', children }: DeskMonitorProps) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 640 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        <defs>
          <clipPath id="monitorScreenClip">
            <rect x="32" y="32" width="576" height="356" rx="16" />
          </clipPath>
        </defs>

        {/* 1. Flat Long Shadow (offset 10px down-right, navy at 14%) */}
        <g opacity="0.14">
          <rect x="20" y="20" width="620" height="400" rx="28" fill="#0E2247" />
          <path d="M255 420 L405 420 L425 490 L235 490 Z" fill="#0E2247" />
          <rect x="210" y="490" width="240" height="24" rx="12" fill="#0E2247" />
        </g>

        {/* 2. Stand Base & Neck */}
        <g id="monitorStand">
          {/* Base plate */}
          <rect x="200" y="480" width="240" height="24" rx="12" fill="#D3DAE3" />
          <rect x="200" y="480" width="240" height="6" rx="3" fill="#FFFFFF" />
          <rect x="200" y="498" width="240" height="6" rx="3" fill="#B9C3D0" />
          {/* Trapezoid Neck */}
          <path d="M245 400 L395 400 L415 480 L225 480 Z" fill="#D3DAE3" />
          <path d="M245 400 L255 400 L235 480 L225 480 Z" fill="#FFFFFF" />
          <path d="M385 400 L395 400 L415 480 L405 480 Z" fill="#B9C3D0" />
          {/* Pill on stand */}
          <rect x="300" y="450" width="40" height="12" rx="6" stroke="#B9C3D0" strokeWidth="2" fill="none" />
        </g>

        {/* 3. Monitor Body (3 tones: light edge #FFFFFF, base #E8ECF1, shadow #B9C3D0) */}
        <g id="monitorBody">
          {/* Base */}
          <rect x="10" y="10" width="620" height="400" rx="28" fill="#E8ECF1" />
          {/* Light edge (top/left) */}
          <path
            d="M38 10 H602 C617 10 630 23 630 38 V40 C630 25 617 12 602 12 H38 C23 12 10 25 10 40 V38 C10 23 23 10 38 10 Z"
            fill="#FFFFFF"
          />
          {/* Shadow edge (bottom/right) */}
          <path
            d="M10 382 C10 397 23 410 38 410 H602 C617 410 630 397 630 382 V380 C630 395 617 408 602 408 H38 C23 408 10 395 10 380 Z"
            fill="#B9C3D0"
          />
        </g>

        {/* 4. Screen Inset (#14346B with glass reflection) */}
        <g id="monitorScreen">
          <rect x="32" y="32" width="576" height="356" rx="16" fill="#14346B" />
          {/* Diagonal Glass Sheen */}
          <g clipPath="url(#monitorScreenClip)">
            <path d="M0 0 L320 0 L120 400 L0 400 Z" fill="#1B4580" opacity="0.6" />
          </g>
          {/* Corner tab / badge */}
          <path d="M42 32 H102 C102 32 102 46 94 48 H42 Z" fill="#6FA8F0" />
        </g>
      </svg>

      {/* Children content mapped over the screen area */}
      {children && (
        <div
          className="absolute flex flex-col items-center justify-center text-center p-6"
          style={{
            top: '8%',
            left: '6.5%',
            width: '87%',
            height: '67%',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
