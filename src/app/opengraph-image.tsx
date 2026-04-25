import { ImageResponse } from "next/og";

export const alt = "Lumus Agency — We light the way.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -180,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: "rgba(212,160,23,0.18)",
            filter: "blur(160px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -160,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "rgba(212,160,23,0.14)",
            filter: "blur(160px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "sans-serif",
            fontSize: 16,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <span>Lumus</span>
          <span style={{ color: "#D4A017" }}>•</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: "sans-serif",
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "#D4A017",
            }}
          >
            <span style={{ width: 32, height: 1, background: "#D4A017" }} />
            <span>Galway, Ireland</span>
          </div>
          <div
            style={{
              fontSize: 132,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
            }}
          >
            <span>We light</span>
            <span style={{ color: "#D4A017", fontStyle: "italic" }}>
              the way.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "sans-serif",
            fontSize: 14,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span>Branding · Web · Social · Motion</span>
          <span>lumus.agency</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
