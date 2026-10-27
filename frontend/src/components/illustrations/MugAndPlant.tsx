import React from 'react';

export function Mug({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Steam path animation */}
        <path
          d="M60 40 Q55 25 65 15 T55 0"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.65"
          className="animate-pulse"
        />
        <path
          d="M80 35 Q85 20 75 10 T85 -5"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.65"
          className="animate-pulse"
        />

        {/* Flat long shadow */}
        <rect x="35" y="75" width="85" height="95" rx="16" fill="#0E2247" opacity="0.14" />
        <circle cx="120" cy="115" r="25" fill="#0E2247" opacity="0.14" />

        {/* Handle */}
        <path
          d="M100 85 C140 85 140 145 100 145"
          stroke="#E8ECF1"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M100 85 C140 85 140 145 100 145"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Cup Body (#E8ECF1 with light top/left, shadow bottom/right) */}
        <rect x="25" y="65" width="85" height="95" rx="16" fill="#E8ECF1" />
        <rect x="25" y="65" width="85" height="6" rx="3" fill="#FFFFFF" />
        <rect x="25" y="154" width="85" height="6" rx="3" fill="#B9C3D0" />

        {/* Inner Coffee surface */}
        <ellipse cx="67" cy="72" rx="36" ry="8" fill="#4A2E18" />
      </svg>
    </div>
  );
}

export function Plant({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Flat long shadow */}
        <polygon points="40,110 120,110 110,190 50,190" fill="#0E2247" opacity="0.14" />

        {/* Leaves: 5 leaf shapes in 3 greens (#2E9E6B, #38B77D, #227A52) */}
        <g id="plantLeaves">
          {/* Leaf 1 (Left) */}
          <path d="M70 100 Q30 70 20 40 Q45 50 75 90 Z" fill="#2E9E6B" />
          {/* Leaf 2 (Right) */}
          <path d="M85 95 Q130 65 140 35 Q115 50 80 90 Z" fill="#38B77D" />
          {/* Leaf 3 (Center High) */}
          <path d="M75 90 Q60 30 75 10 Q95 35 80 90 Z" fill="#227A52" />
          {/* Leaf 4 (Center Left) */}
          <path d="M70 95 Q40 45 45 25 Q65 45 75 90 Z" fill="#38B77D" />
          {/* Leaf 5 (Center Right) */}
          <path d="M80 95 Q115 45 110 25 Q95 45 75 90 Z" fill="#2E9E6B" />
        </g>

        {/* Pot: #C98B4A with rim and bottom shadow */}
        <polygon points="35,100 125,100 110,180 50,180" fill="#C98B4A" />
        <rect x="30" y="94" width="100" height="14" rx="4" fill="#E2A665" />
        <polygon points="48,172 112,172 110,180 50,180" fill="#A86E32" />
      </svg>
    </div>
  );
}

export function StickyNote({
  color = 'sunny',
  text = '',
  className = '',
  rotation = 0
}: {
  color?: 'sunny' | 'sky' | 'pink';
  text?: string;
  className?: string;
  rotation?: number;
}) {
  const bg = color === 'sunny' ? '#FFD43B' : color === 'sky' ? '#6FA8F0' : '#F29DB0';
  const fold = color === 'sunny' ? '#E5B820' : color === 'sky' ? '#4F88D0' : '#D8788E';

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Flat long shadow */}
        <polygon points="15,15 160,15 195,50 195,195 15,195" fill="#0E2247" opacity="0.14" />

        {/* Note Body */}
        <polygon points="10,10 155,10 190,45 190,190 10,190" fill={bg} />
        {/* Folded Corner */}
        <polygon points="155,10 155,45 190,45" fill={fold} />
      </svg>
      {text && (
        <div className="absolute inset-4 flex items-center justify-center p-3 text-center font-bold text-xs font-mono text-[#0E2247] leading-tight">
          {text}
        </div>
      )}
    </div>
  );
}
