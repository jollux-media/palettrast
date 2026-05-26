import React from "react";

export function LogoPalettrast({ height = 36 }: { height?: number }) {
  const fontSize = height * 0.72;
  return (
    <span
      style={{ display: "inline-flex", alignItems: "baseline", userSelect: "none", lineHeight: 1 }}
      aria-label="Palettrast"
    >
      <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize, color: "#374151", letterSpacing: "-0.5px" }}>
        Palet
      </span>
      <span style={{ fontFamily: "'Satisfy', cursive", fontWeight: 400, fontSize: fontSize * 1.1, color: "#6366F1", letterSpacing: "0px" }}>
        trast
      </span>
    </span>
  );
}
