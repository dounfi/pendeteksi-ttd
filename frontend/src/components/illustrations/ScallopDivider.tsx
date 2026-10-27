import React from 'react';

export function ScallopDivider({ from = '#3B82DC', to = '#14346B', flip = false }: { from?: string; to?: string; flip?: boolean }) {
  // 28px bumps scalloped wave
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`} style={{ backgroundColor: from }}>
      <svg
        viewBox="0 0 1440 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-7 block"
        preserveAspectRatio="repeat-x"
      >
        <path
          d="M0 32 C14 32, 14 0, 28 0 C42 0, 42 32, 56 32 C70 32, 70 0, 84 0 C98 0, 98 32, 112 32 C126 32, 126 0, 140 0 C154 0, 154 32, 168 32 C182 32, 182 0, 196 0 C210 0, 210 32, 224 32 C238 32, 238 0, 252 0 C266 0, 266 32, 280 32 C294 32, 294 0, 308 0 C322 0, 322 32, 336 32 C350 32, 350 0, 364 0 C378 0, 378 32, 392 32 C406 32, 406 0, 420 0 C434 0, 434 32, 448 32 C462 32, 462 0, 476 0 C490 0, 490 32, 504 32 C518 32, 518 0, 532 0 C546 0, 546 32, 560 32 C574 32, 574 0, 588 0 C602 0, 602 32, 616 32 C630 32, 630 0, 644 0 C658 0, 658 32, 672 32 C686 32, 686 0, 700 0 C714 0, 714 32, 728 32 C742 32, 742 0, 756 0 C770 0, 770 32, 784 32 C798 32, 798 0, 812 0 C826 0, 826 32, 840 32 C854 32, 854 0, 868 0 C882 0, 882 32, 896 32 C910 32, 910 0, 924 0 C938 0, 938 32, 952 32 C966 32, 966 0, 980 0 C994 0, 994 32, 1008 32 C1022 32, 1022 0, 1036 0 C1050 0, 1050 32, 1064 32 C1078 32, 1078 0, 1092 0 C1106 0, 1106 32, 1120 32 C1134 32, 1134 0, 1148 0 C1162 0, 1162 32, 1176 32 C1190 32, 1190 0, 1204 0 C1218 0, 1218 32, 1232 32 C1246 32, 1246 0, 1260 0 C1274 0, 1274 32, 1288 32 C1302 32, 1302 0, 1316 0 C1330 0, 1330 32, 1344 32 C1358 32, 1358 0, 1372 0 C1386 0, 1386 32, 1400 32 C1414 32, 1414 0, 1428 0 C1442 0, 1442 32, 1456 32 L1456 32 L0 32 Z"
          fill={to}
        />
      </svg>
    </div>
  );
}

export function ConfettiDecor({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none absolute ${className}`} aria-hidden="true">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        {/* Plus signs */}
        <path d="M20 15v10M15 20h10" stroke="#FFD43B" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 45v8M96 49h8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 95v10M35 100h10" stroke="#F7A23B" strokeWidth="3" strokeLinecap="round" />
        {/* Dots */}
        <circle cx="85" cy="18" r="4" fill="#FFD43B" />
        <circle cx="25" cy="65" r="3" fill="#FFFFFF" />
        <circle cx="105" cy="85" r="4.5" fill="#F7A23B" />
        {/* Dashes */}
        <rect x="55" y="12" width="10" height="3" rx="1.5" fill="#FFFFFF" transform="rotate(25 55 12)" />
        <rect x="75" y="70" width="8" height="3" rx="1.5" fill="#FFD43B" transform="rotate(-30 75 70)" />
        {/* 4-point Sparkle */}
        <path d="M60 40 Q60 50 70 50 Q60 50 60 60 Q60 50 50 50 Q60 50 60 40Z" fill="#FFD43B" />
      </svg>
    </div>
  );
}
