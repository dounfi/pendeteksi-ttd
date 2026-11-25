import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScanFrame, VerificationScanOverlay } from "@/components/periksa/SignatureScanStage";

describe("SignatureScanStage", () => {
  it("renders ScanFrame with paper pop and sheen animation when scanMode is once", () => {
    const { container } = render(
      <ScanFrame
        src="data:image/png;base64,iVBORw0KGgo="
        alt="Pratinjau tanda tangan"
        scanMode="once"
        popKey={1}
      />,
    );

    expect(screen.getByAltText("Pratinjau tanda tangan")).toBeInTheDocument();
    expect(container.querySelector(".animate-doc-pop")).toBeInTheDocument();
    expect(container.querySelector(".animate-paper-sheen")).toBeInTheDocument();
    expect(screen.getByText("Terbaca")).toBeInTheDocument();
  });

  it("renders dual-sheet forensic comparison overlay only when open", () => {
    const { rerender } = render(
      <VerificationScanOverlay
        isOpen={false}
        refImageSrc="data:image/png;base64,iVBORw0KGgo="
        qryImageSrc="data:image/png;base64,iVBORw0KGgo="
        refCount={2}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <VerificationScanOverlay
        isOpen
        refImageSrc="data:image/png;base64,iVBORw0KGgo="
        qryImageSrc="data:image/png;base64,iVBORw0KGgo="
        refCount={2}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Meja Pemeriksaan SIDIKTA")).toBeInTheDocument();
    expect(screen.getByText("2 contoh")).toBeInTheDocument();
    expect(screen.getByAltText("Tanda tangan acuan asli")).toBeInTheDocument();
    expect(screen.getByAltText("Tanda tangan yang diperiksa")).toBeInTheDocument();
    expect(screen.getAllByText("Ratakan Cahaya")).toHaveLength(2);
    expect(screen.getByText("Uji Goyang")).toBeInTheDocument();
  });
});
