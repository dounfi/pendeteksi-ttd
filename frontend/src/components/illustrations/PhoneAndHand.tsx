import React from 'react';

export function PhoneTopDown({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg viewBox="0 0 200 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Flat long shadow */}
        <rect x="25" y="25" width="160" height="320" rx="32" fill="#0E2247" opacity="0.14" />

        {/* Phone Body #14346B with highlight edge */}
        <rect x="15" y="15" width="160" height="320" rx="32" fill="#14346B" />
        <rect x="15" y="15" width="160" height="6" rx="3" fill="#2E4470" />
        <rect x="15" y="329" width="160" height="6" rx="3" fill="#0E2247" />

        {/* Screen #0E2247 */}
        <rect x="25" y="35" width="140" height="280" rx="22" fill="#0E2247" />

        {/* Screen camera viewport mockup */}
        <rect x="35" y="60" width="120" height="210" rx="12" fill="#1E4FA8" opacity="0.4" />
        {/* Target Reticle corners */}
        <path d="M45 80 h15 M45 80 v15 M145 80 h-15 M145 80 v15 M45 250 h15 M45 250 v-15 M145 250 h-15 M145 250 v-15" stroke="#FFD43B" strokeWidth="3" strokeLinecap="round" />
        {/* Shutter button */}
        <circle cx="95" cy="290" r="14" fill="#FFFFFF" />
        <circle cx="95" cy="290" r="10" fill="#FFD43B" />
      </svg>
    </div>
  );
}

export function ShadowOverlay({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none absolute inset-0 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
        {/* Diagonal phone cast shadow over a sheet */}
        <polygon points="60,0 240,0 360,300 120,300" fill="#0E2247" opacity="0.32" />
      </svg>
    </div>
  );
}

export function HandWithPen({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shadow */}
        <path d="M60 120 Q120 100 180 160 Q140 210 70 180 Z" fill="#0E2247" opacity="0.14" />

        {/* Pen being held */}
        <g transform="rotate(-35 120 120)">
          <rect x="110" y="20" width="16" height="180" rx="3" fill="#14346B" />
          <polygon points="110,200 126,200 118,225" fill="#C9D1DC" />
          <polygon points="115,220 121,220 118,225" fill="#2B303B" />
        </g>

        {/* Hand in skin tones #F2C9A5 / #E2AE86 / #C98F68 */}
        {/* Wrist & Palm */}
        <path d="M20 150 Q70 120 110 135 Q150 150 140 180 Q80 200 20 185 Z" fill="#E2AE86" />
        {/* Fingers curling around pen */}
        <ellipse cx="125" cy="135" rx="16" ry="12" fill="#F2C9A5" />
        <ellipse cx="115" cy="150" rx="16" ry="12" fill="#F2C9A5" />
        <ellipse cx="100" cy="165" rx="16" ry="12" fill="#E2AE86" />
        {/* Thumb */}
        <path d="M70 150 Q100 120 125 125 Q135 135 110 155 Z" fill="#F2C9A5" />
      </svg>
    </div>
  );
}
