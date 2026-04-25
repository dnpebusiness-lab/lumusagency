import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0A",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 120,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <span style={{ fontStyle: "italic" }}>L</span>
          <span style={{ color: "#D4A017", fontSize: 36, marginLeft: 4 }}>•</span>
        </div>
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "sans-serif",
          }}
        >
          Lumus
        </div>
      </div>
    ),
    { ...size },
  );
}
