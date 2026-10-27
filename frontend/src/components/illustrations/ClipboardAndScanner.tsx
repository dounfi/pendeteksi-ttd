import React from 'react';

interface ClipboardProps {
  className?: string;
  children?: React.ReactNode;
}

export function Clipboard({ className = '', children }: ClipboardProps) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 420 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        {/* Flat long shadow */}
        <rect x="25" y="45" width="375" height="500" rx="20" fill="#0E2247" opacity="0.14" />

        {/* 1. Wooden Board (#C98B4A with light and dark edges) */}
        <rect x="15" y="35" width="375" height="500" rx="20" fill="#C98B4A" />
        <rect x="15" y="35" width="375" height="8" rx="4" fill="#E2A665" />
        <rect x="15" y="527" width="375" height="8" rx="4" fill="#A86E32" />

        {/* 2. Yellow Notepad Sheet (#FFD43B with faint rule lines #E5B820) */}
        <g id="yellowSheet">
          <rect x="35" y="65" width="335" height="445" rx="10" fill="#FFD43B" />
          {/* 10 horizontal rule lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={i}
              x1="55"
              y1={120 + i * 36}
              x2="350"
              y2={120 + i * 36}
              stroke="#E5B820"
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.8"
            />
          ))}
          {/* Perforated torn-paper notch at top */}
          <line x1="35" y1="85" x2="370" y2="85" stroke="#E5B820" strokeWidth="2" strokeDasharray="6 4" />
        </g>

        {/* 3. Metal Clip on top: rounded rect #B8C2CF with hole circle and highlight #E8EEF5 */}
        <g id="metalClip">
          {/* Clip base shadow */}
          <rect x="145" y="24" width="130" height="42" rx="10" fill="#0E2247" opacity="0.14" />
          {/* Clip base */}
          <rect x="140" y="20" width="130" height="42" rx="10" fill="#B8C2CF" />
          <rect x="140" y="20" width="130" height="6" rx="3" fill="#E8EEF5" />
          <rect x="140" y="56" width="130" height="6" rx="3" fill="#8C9AA9" />
          {/* Circle hole */}
          <circle cx="205" cy="40" r="10" fill="#C98B4A" />
          <circle cx="205" cy="40" r="10" stroke="#8C9AA9" strokeWidth="2" fill="none" />
        </g>
      </svg>

      {/* Children container over the notepad sheet */}
      {children && (
        <div
          className="absolute flex flex-col p-4 overflow-hidden"
          style={{
            top: '15%',
            left: '11%',
            width: '78%',
            height: '75%',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface ScannerProps {
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

export function Scanner({ className = '', animated = true, children }: ScannerProps) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 520 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        <defs>
          <clipPath id="scannerGlassClip">
            <rect x="45" y="65" width="430" height="280" rx="12" />
          </clipPath>
          <filter id="lightGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Flat long shadow */}
        <rect x="22" y="22" width="490" height="346" rx="24" fill="#0E2247" opacity="0.14" />

        {/* 1. Scanner Body: #E8ECF1, light top, shadow side */}
        <rect x="12" y="12" width="490" height="346" rx="24" fill="#E8ECF1" />
        <rect x="12" y="12" width="490" height="8" rx="4" fill="#FFFFFF" />
        <rect x="12" y="350" width="490" height="8" rx="4" fill="#B9C3D0" />

        {/* 2. Top Hinge Bar */}
        <rect x="35" y="24" width="450" height="24" rx="8" fill="#D3DAE3" />
        <line x1="60" y1="36" x2="160" y2="36" stroke="#B9C3D0" strokeWidth="3" strokeLinecap="round" />
        <line x1="360" y1="36" x2="460" y2="36" stroke="#B9C3D0" strokeWidth="3" strokeLinecap="round" />

        {/* 3. Glass Inset: #BFD9F5 with diagonal glare stripes */}
        <rect x="45" y="65" width="430" height="280" rx="12" fill="#BFD9F5" />
        <g clipPath="url(#scannerGlassClip)">
          {/* Glare stripes */}
          <path d="M70 65 L170 65 L90 350 L-10 350 Z" fill="#FFFFFF" opacity="0.45" />
          <path d="M220 65 L270 65 L190 350 L140 350 Z" fill="#FFFFFF" opacity="0.3" />

          {/* Sweeping Light-Bar */}
          <g className={animated ? 'animate-scanline' : ''}>
            <rect
              x="30"
              y="160"
              width="460"
              height="16"
              fill="#FFFFFF"
              opacity="0.8"
              filter="url(#lightGlow)"
            />
            <line x1="30" y1="168" x2="490" y2="168" stroke="#FFFFFF" strokeWidth="3" />
          </g>
        </g>
      </svg>

      {/* Children container over the scanner glass */}
      {children && (
        <div
          className="absolute flex flex-col p-4 overflow-hidden"
          style={{
            top: '20%',
            left: '11%',
            width: '78%',
            height: '68%',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function Magnifier({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 220 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        {/* Flat long shadow */}
        <g opacity="0.14">
          <circle cx="85" cy="85" r="60" fill="#0E2247" />
          <rect x="135" y="135" width="40" height="110" rx="18" transform="rotate(-40 135 135)" fill="#0E2247" />
        </g>

        {/* Handle: rounded rect rotated 40deg, #F7A23B with darker grip band */}
        <g transform="rotate(-40 125 125)">
          <rect x="110" y="125" width="34" height="115" rx="17" fill="#F7A23B" />
          <rect x="110" y="125" width="34" height="6" rx="3" fill="#FFC773" />
          <rect x="110" y="234" width="34" height="6" rx="3" fill="#D4811F" />
          {/* Grip band */}
          <rect x="108" y="160" width="38" height="24" rx="4" fill="#14346B" />
        </g>

        {/* Ring: #F7A23B (light #FFC773 top/left, shadow #D4811F bottom/right) */}
        <circle cx="75" cy="75" r="60" fill="#F7A23B" />
        <circle cx="75" cy="75" r="60" stroke="#FFC773" strokeWidth="5" />
        <circle cx="75" cy="75" r="46" fill="none" stroke="#D4811F" strokeWidth="4" />

        {/* Lens: rgba(255,255,255,.35) with glare arc */}
        <circle cx="75" cy="75" r="45" fill="rgba(255,255,255,0.35)" />
        <path
          d="M45 55 A35 35 0 0 1 95 42"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
