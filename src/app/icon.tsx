import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0A",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontSize: 24,
          letterSpacing: "-0.02em",
        }}
      >
        <span style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontStyle: "italic" }}>L</span>
          <span style={{ color: "#D4A017", fontSize: 10, marginLeft: 1 }}>•</span>
        </span>
      </div>
    ),
    { ...size },
  );
}
