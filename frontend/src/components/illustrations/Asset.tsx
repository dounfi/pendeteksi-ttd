import React, { useState } from 'react';
import { DeskMonitor } from './DeskMonitor';
import { Keyboard, Mouse } from './KeyboardAndMouse';
import { Clipboard, Scanner, Magnifier } from './ClipboardAndScanner';
import { SignatureDocument, Pencil, StampAndPad, StatusBadge } from './SignatureDocumentAndPencil';
import { Mug, Plant, StickyNote } from './MugAndPlant';
import { FilingCabinet, ShelfWithFolders, DeskLamp } from './IsoOffice';
import { PhoneTopDown, ShadowOverlay, HandWithPen } from './PhoneAndHand';
import { ScallopDivider, ConfettiDecor } from './ScallopDivider';

interface AssetProps {
  name: string;
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Asset({ name, className = '', animated = true, children, ...props }: AssetProps) {
  // Try loading /public/assets/{name}.webp or .png first
  const [imgError, setImgError] = useState(false);

  // If we can render SVG directly
  const renderSvgComponent = () => {
    switch (name.toLowerCase()) {
      case 'deskmonitor':
      case 'monitor':
        return <DeskMonitor className={className}>{children}</DeskMonitor>;
      case 'keyboard':
        return <Keyboard className={className} />;
      case 'mouse':
        return <Mouse className={className} animated={animated} />;
      case 'clipboard':
        return <Clipboard className={className}>{children}</Clipboard>;
      case 'scanner':
        return <Scanner className={className} animated={animated}>{children}</Scanner>;
      case 'magnifier':
        return <Magnifier className={className} />;
      case 'signaturedocument':
      case 'document':
        return <SignatureDocument className={className} {...props} />;
      case 'pencil':
        return <Pencil className={className} />;
      case 'stamp':
      case 'stampandpad':
        return <StampAndPad className={className} {...props} />;
      case 'mug':
        return <Mug className={className} />;
      case 'plant':
        return <Plant className={className} />;
      case 'stickynote':
        return <StickyNote className={className} {...props} />;
      case 'filingcabinet':
        return <FilingCabinet className={className} />;
      case 'shelf':
        return <ShelfWithFolders className={className} />;
      case 'desklamp':
        return <DeskLamp className={className} />;
      case 'phone':
        return <PhoneTopDown className={className} />;
      case 'hand':
        return <HandWithPen className={className} />;
      case 'badge':
        return <StatusBadge className={className} {...props} />;
      default:
        return null;
    }
  };

  // If no error, we could try an image tag with fallback to SVG
  if (!imgError) {
    return (
      <div className={`relative inline-block ${className}`}>
        <img
          src={`/assets/${name}.webp`}
          alt={name}
          className="w-full h-auto block"
          onError={() => setImgError(true)}
          style={{ display: imgError ? 'none' : 'block' }}
        />
        {/* If image loads and has children */}
        {children && <div className="absolute inset-0">{children}</div>}
      </div>
    );
  }

  return <>{renderSvgComponent()}</>;
}

export {
  DeskMonitor,
  Keyboard,
  Mouse,
  Clipboard,
  Scanner,
  Magnifier,
  SignatureDocument,
  Pencil,
  StampAndPad,
  StatusBadge,
  Mug,
  Plant,
  StickyNote,
  FilingCabinet,
  ShelfWithFolders,
  DeskLamp,
  PhoneTopDown,
  ShadowOverlay,
  HandWithPen,
  ScallopDivider,
  ConfettiDecor
};
