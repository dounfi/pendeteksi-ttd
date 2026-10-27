import React from 'react';

export function SignatureDocument({ className = '', signatureOnly = false }: { className?: string; signatureOnly?: boolean }) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 360 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        {/* Flat long shadow */}
        <polygon points="20,20 280,20 350,90 350,470 20,470" fill="#0E2247" opacity="0.14" />

        {/* Paper Sheet: #FFFDF5 */}
        <polygon points="10,10 270,10 340,80 340,460 10,460" fill="#FFFDF5" />
        {/* Folded Corner */}
        <polygon points="270,10 270,80 340,80" fill="#E2E8F0" />
        <polygon points="270,10 270,80 340,80" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />

        {/* 6 Gray Text Lines */}
        {!signatureOnly && (
          <g opacity="0.6">
            <line x1="40" y1="60" x2="180" y2="60" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
            <line x1="40" y1="90" x2="220" y2="90" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
            <line x1="40" y1="120" x2="310" y2="120" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <line x1="40" y1="145" x2="290" y2="145" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <line x1="40" y1="170" x2="300" y2="170" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
            <line x1="40" y1="195" x2="260" y2="195" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* Sign Here "X" & dotted line */}
        <text x="45" y="370" fill="#F7A23B" fontFamily="monospace" fontSize="24" fontWeight="bold">✕</text>
        <line x1="75" y1="365" x2="290" y2="365" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 4" />

        {/* Hand-drawn Signature Path (Navy cubic curves) */}
        <path
          d="M65 350 C80 300, 110 310, 100 360 C90 410, 130 310, 150 330 C170 350, 160 380, 190 335 C220 290, 210 370, 240 330 C270 290, 290 320, 280 365"
          stroke="#14346B"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Paraph underline flourish */}
        <path
          d="M85 385 C140 380, 220 375, 295 382"
          stroke="#14346B"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function Pencil({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 520 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        {/* Flat long shadow */}
        <polygon points="12,20 440,20 440,58 12,58" fill="#0E2247" opacity="0.14" />

        {/* 1. Pink Eraser (#F29DB0) */}
        <rect x="2" y="10" width="46" height="38" rx="8" fill="#F29DB0" />
        <rect x="2" y="10" width="46" height="6" rx="3" fill="#FFC0D0" />
        <rect x="2" y="42" width="46" height="6" rx="3" fill="#D8788E" />

        {/* 2. Silver Ferrule (#C9D1DC) */}
        <rect x="44" y="8" width="28" height="42" rx="4" fill="#C9D1DC" />
        <line x1="52" y1="8" x2="52" y2="50" stroke="#8C9AA9" strokeWidth="2" />
        <line x1="62" y1="8" x2="62" y2="50" stroke="#8C9AA9" strokeWidth="2" />

        {/* 3. Hexagonal Yellow Body (#FFD43B with stripes) */}
        <rect x="72" y="10" width="360" height="38" rx="2" fill="#FFD43B" />
        {/* Top lighter stripe */}
        <rect x="72" y="10" width="360" height="10" fill="#FFE585" />
        {/* Bottom darker stripe */}
        <rect x="72" y="38" width="360" height="10" fill="#E5B820" />

        {/* 4. Wooden Tip Triangle (#F2C99B) */}
        <polygon points="432,10 500,29 432,48" fill="#F2C99B" />
        <polygon points="432,10 500,29 432,29" fill="#FADBB7" />

        {/* 5. Graphite Tip (#2B303B) */}
        <polygon points="475,22 500,29 475,36" fill="#2B303B" />
      </svg>
    </div>
  );
}

export function StampAndPad({ className = '', status = 'verified' }: { className?: string; status?: 'verified' | 'forged' | 'uncertain' }) {
  const statusColor = status === 'verified' ? '#2E9E6B' : status === 'forged' ? '#E5484D' : '#F7A23B';

  return (
    <div className={`inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        {/* Ink Pad (Bottom) */}
        <g id="inkPad">
          <rect x="40" y="210" width="220" height="60" rx="16" fill="#14346B" />
          <rect x="40" y="210" width="220" height="6" rx="3" fill="#2E4470" />
          <rect x="40" y="264" width="220" height="6" rx="3" fill="#0E2247" />
          {/* Inner inked surface */}
          <rect x="52" y="222" width="196" height="36" rx="8" fill="#0E2247" />
          <rect x="56" y="226" width="188" height="28" rx="6" fill={statusColor} opacity="0.85" />
        </g>

        {/* Stamp (Top) */}
        <g id="stampObject">
          {/* Knob handle: #F7A23B */}
          <circle cx="150" cy="50" r="30" fill="#F7A23B" />
          <circle cx="150" cy="50" r="30" stroke="#FFC773" strokeWidth="4" />
          {/* Neck */}
          <path d="M140 76 L160 76 L175 140 L125 140 Z" fill="#D4811F" />
          <path d="M140 76 L150 76 L140 140 L125 140 Z" fill="#FFC773" />
          {/* Wide base #14346B */}
          <rect x="80" y="140" width="140" height="40" rx="10" fill="#14346B" />
          <rect x="80" y="140" width="140" height="6" rx="3" fill="#2E4470" />
          {/* Rubber cushion */}
          <rect x="86" y="176" width="128" height="10" rx="2" fill={statusColor} />
        </g>
      </svg>
    </div>
  );
}

export function StatusBadge({ status = 'verified', size = 48, className = '' }: { status?: 'verified' | 'forged' | 'uncertain'; size?: number; className?: string }) {
  const color = status === 'verified' ? '#2E9E6B' : status === 'forged' ? '#E5484D' : '#F7A23B';

  return (
    <div className={`inline-block select-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
        {/* Circle with 4px white border and status color fill */}
        <circle cx="32" cy="32" r="28" fill={color} stroke="#FFFFFF" strokeWidth="4" />
        {status === 'verified' && (
          <path d="M20 32 L28 40 L44 24" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {status === 'forged' && (
          <path d="M22 22 L42 42 M42 22 L22 42" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        )}
        {status === 'uncertain' && (
          <path d="M32 20 C36 20 38 23 38 26 C38 31 32 32 32 36 M32 44 v.01" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
