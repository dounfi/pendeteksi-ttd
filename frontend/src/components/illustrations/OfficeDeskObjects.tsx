import React from 'react';

// 1. KeyboardCorner (cropped keyboard peeking from edge)
export function KeyboardCorner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Contact Shadow */}
        <path d="M10 20 L310 20 L310 210 L10 210 Z" fill="#14213D" opacity="0.16" />
        {/* Chassis */}
        <rect x="0" y="10" width="310" height="200" rx="16" fill="#F4F6F9" />
        <rect x="0" y="10" width="310" height="4" rx="2" fill="#FFFFFF" />
        <rect x="0" y="206" width="310" height="4" rx="2" fill="#C9D1DC" />
        {/* Key Bed */}
        <rect x="14" y="24" width="282" height="172" rx="10" fill="#E2E8F0" />
        {/* Key rows */}
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            {[0, 1, 2, 3, 4, 5].map((c) => {
              const x = 24 + c * 44;
              const y = 34 + r * 40;
              const isAccent = r === 0 && c === 0; // Red/orange Esc
              return (
                <g key={c}>
                  <rect
                    x={x}
                    y={y}
                    width="36"
                    height="32"
                    rx="6"
                    fill={isAccent ? '#D94B3D' : r === 1 && c < 2 ? '#24344D' : '#FFFFFF'}
                  />
                  <rect
                    x={x}
                    y={y}
                    width="36"
                    height="4"
                    rx="2"
                    fill={isAccent ? '#F27568' : r === 1 && c < 2 ? '#3E557A' : '#FFFFFF'}
                  />
                  <rect
                    x={x}
                    y={y + 28}
                    width="36"
                    height="4"
                    rx="2"
                    fill={isAccent ? '#A83125' : r === 1 && c < 2 ? '#162235' : '#D1D5DB'}
                  />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

// 2. Mouse with Cable
export function MouseWithCable({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block overflow-visible">
        {/* Curving white/light cable */}
        <path
          d="M100 120 C100 60, -20 50, -40 10 C-60 -30, 20 -80, 0 -120"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        {/* Shadow */}
        <rect x="58" y="128" width="94" height="154" rx="47" fill="#14213D" opacity="0.16" />
        {/* White mouse body */}
        <rect x="50" y="120" width="94" height="154" rx="47" fill="#FFFEFA" />
        <rect x="50" y="120" width="94" height="6" rx="3" fill="#FFFFFF" />
        <rect x="50" y="268" width="94" height="6" rx="3" fill="#D5CEBE" />
        {/* Center seam */}
        <line x1="97" y1="120" x2="97" y2="185" stroke="#E2E8F0" strokeWidth="2" />
        {/* Navy scroll wheel */}
        <rect x="91" y="142" width="12" height="26" rx="6" fill="#14213D" />
      </svg>
    </div>
  );
}

// 3. Pen (ballpoint / drafting pen)
export function Pen({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 420 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shadow */}
        <polygon points="10,18 390,18 390,44 10,44" fill="#14213D" opacity="0.16" />
        {/* Pen Barrel: Navy #14213D with silver accents */}
        <rect x="50" y="12" width="310" height="24" rx="4" fill="#14213D" />
        <rect x="50" y="12" width="310" height="4" fill="#2E4470" />
        <rect x="50" y="32" width="310" height="4" fill="#0A1426" />
        {/* Grip band */}
        <rect x="300" y="12" width="45" height="24" fill="#1E293B" />
        <line x1="315" y1="12" x2="315" y2="36" stroke="#475569" strokeWidth="2" />
        <line x1="330" y1="12" x2="330" y2="36" stroke="#475569" strokeWidth="2" />
        {/* Silver Clip */}
        <rect x="70" y="6" width="90" height="6" rx="2" fill="#E2E8F0" />
        <rect x="60" y="10" width="16" height="28" rx="3" fill="#CBD5E1" />
        {/* Nib section */}
        <polygon points="360,12 405,24 360,36" fill="#CBD5E1" />
        <polygon points="395,21 405,24 395,27" fill="#1E293B" />
      </svg>
    </div>
  );
}

// 4. Pencil
export function Pencil({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 420 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shadow */}
        <polygon points="8,16 390,16 390,38 8,38" fill="#14213D" opacity="0.16" />
        {/* Eraser */}
        <rect x="0" y="8" width="38" height="26" rx="4" fill="#F7B5CB" />
        <rect x="0" y="8" width="38" height="4" fill="#FAD1DF" />
        {/* Ferrule */}
        <rect x="34" y="6" width="22" height="30" rx="3" fill="#D1D5DB" />
        {/* Yellow Body */}
        <rect x="56" y="8" width="290" height="26" fill="#FFE27A" />
        <rect x="56" y="8" width="290" height="5" fill="#FFF2B8" />
        <rect x="56" y="29" width="290" height="5" fill="#E5C34D" />
        {/* Wooden Tip */}
        <polygon points="346,8 405,21 346,34" fill="#E2C07C" />
        {/* Graphite tip */}
        <polygon points="385,17 405,21 385,25" fill="#14213D" />
      </svg>
    </div>
  );
}

// 5. BinderClip (metallic binder clip)
export function BinderClip({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shadow */}
        <rect x="18" y="28" width="68" height="46" rx="6" fill="#14213D" opacity="0.16" />
        {/* Black clip body */}
        <rect x="14" y="24" width="68" height="46" rx="6" fill="#14213D" />
        <rect x="14" y="24" width="68" height="5" rx="2" fill="#2E4470" />
        {/* Silver wire handles */}
        <path d="M28 24 L28 8 C28 4, 34 2, 48 2 C62 2, 68 4, 68 8 L68 24" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

// 6. PushPin (office push pin)
export function PushPin({ color = '#1F4FBF', className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shadow */}
        <ellipse cx="32" cy="62" rx="14" ry="6" fill="#14213D" opacity="0.2" />
        {/* Pin head */}
        <circle cx="28" cy="22" r="14" fill={color} />
        <ellipse cx="28" cy="18" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" />
        <path d="M20 28 L24 44 L32 44 L36 28 Z" fill={color} />
        {/* Metal pin point */}
        <polygon points="26,44 30,44 28,62" fill="#CBD5E1" />
      </svg>
    </div>
  );
}

// 7. Magnifier
export function Magnifier({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shadow */}
        <circle cx="68" cy="68" r="48" fill="#14213D" opacity="0.16" />
        <rect x="100" y="100" width="22" height="70" rx="11" transform="rotate(-40 100 100)" fill="#14213D" opacity="0.16" />
        {/* Handle */}
        <g transform="rotate(-40 92 92)">
          <rect x="82" y="92" width="20" height="74" rx="10" fill="#E2C07C" />
          <rect x="80" y="112" width="24" height="14" rx="2" fill="#1F4FBF" />
        </g>
        {/* Rim: Metallic/Amber */}
        <circle cx="58" cy="58" r="48" stroke="#E2C07C" strokeWidth="8" fill="#FFFFFF" fillOpacity="0.3" />
        <circle cx="58" cy="58" r="44" stroke="#FFE27A" strokeWidth="2" fill="none" />
        {/* Lens reflection arc */}
        <path d="M36 44 A32 32 0 0 1 74 32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 8. SignatureSheet (Document with signature that draws itself)
export function SignatureSheet({
  className = '',
  drawSignature = true,
  signName = 'SignaCheck'
}: {
  className?: string;
  drawSignature?: boolean;
  signName?: string;
}) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Shadow */}
        <rect x="10" y="10" width="300" height="380" rx="6" fill="#14213D" opacity="0.14" />
        {/* Cream paper sheet */}
        <rect x="4" y="4" width="300" height="380" rx="4" fill="#F7F2E6" stroke="rgba(20, 33, 61, 0.08)" strokeWidth="1" />
        {/* Rule lines */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={i}
            x1="36"
            y1={50 + i * 26}
            x2={i === 0 ? 160 : i === 6 ? 200 : 270}
            stroke="#14213D"
            strokeWidth={i === 0 ? 3 : 1.5}
            strokeLinecap="round"
            opacity={i === 0 ? 0.4 : 0.18}
          />
        ))}

        {/* Verification target box */}
        <rect x="32" y="240" width="246" height="110" rx="4" fill="#FFFEFA" stroke="rgba(20, 33, 61, 0.12)" strokeWidth="1" />
        <text x="44" y="260" fill="#14213D" opacity="0.4" fontSize="10" fontFamily="DM Sans" fontWeight="bold">
          TANDA TANGAN RESMI
        </text>
        <line x1="44" y1="324" x2="260" y2="324" stroke="#14213D" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />

        {/* Hand-drawn signature curve */}
        {drawSignature && (
          <path
            d="M60 310 C75 260, 95 270, 90 320 C85 360, 115 265, 130 280 C145 295, 140 330, 165 290 C190 250, 185 325, 210 285 C235 250, 255 280, 245 315 M80 332 C130 328, 190 324, 250 330"
            stroke="#14213D"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
}

// 9. IdCard on a Lanyard (Reference style: ID sleeve + clip + blue ribbon + initials, NO faces!)
export function IdCard({
  initials = 'QH',
  name = 'Quang Hai',
  role = 'Peneliti Forensik',
  className = ''
}: {
  initials?: string;
  name?: string;
  role?: string;
  className?: string;
}) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
        {/* Blue Lanyard Strap (curving from top) */}
        <path d="M100 -20 Q70 15 100 40" stroke="#1F4FBF" strokeWidth="16" fill="none" strokeLinecap="round" />
        {/* Metal Swivel Hook / Clip */}
        <rect x="94" y="36" width="12" height="16" rx="3" fill="#CBD5E1" />
        <ellipse cx="100" cy="56" rx="8" ry="4" fill="#94A3B8" />

        {/* ID Card Sleeve Shadow */}
        <rect x="24" y="60" width="156" height="240" rx="10" fill="#14213D" opacity="0.18" />
        {/* Plastic Transparent Sleeve Border */}
        <rect x="20" y="52" width="156" height="240" rx="10" fill="#FFFFFF" fillOpacity="0.9" stroke="rgba(20, 33, 61, 0.15)" strokeWidth="2" />
        {/* Top slot cutout */}
        <rect x="80" y="60" width="36" height="8" rx="4" fill="#E2E8F0" />

        {/* Card Inside */}
        <rect x="28" y="74" width="140" height="206" rx="6" fill="#FFFEFA" />
        {/* Header Bar */}
        <rect x="28" y="74" width="140" height="24" rx="4" fill="#1F4FBF" />
        <text x="98" y="89" fill="#FFFFFF" fontSize="9" fontFamily="Bricolage Grotesque" fontWeight="800" textAnchor="middle">
          SIGNACHECK ID
        </text>

        {/* Initials Photo Box (NO face, initials only!) */}
        <rect x="48" y="106" width="100" height="90" rx="6" fill="#14213D" />
        <text x="98" y="160" fill="#FFFEFA" fontSize="32" fontFamily="Bricolage Grotesque" fontWeight="800" textAnchor="middle">
          {initials}
        </text>

        {/* Text Details */}
        <text x="98" y="214" fill="#14213D" fontSize="12" fontFamily="Bricolage Grotesque" fontWeight="800" textAnchor="middle">
          {name}
        </text>
        <text x="98" y="230" fill="#64748B" fontSize="9" fontFamily="DM Sans" fontWeight="bold" textAnchor="middle">
          {role}
        </text>

        {/* Barcode line mock */}
        <line x1="50" y1="250" x2="146" y2="250" stroke="#14213D" strokeWidth="2" strokeDasharray="3 2" />
      </svg>
    </div>
  );
}
