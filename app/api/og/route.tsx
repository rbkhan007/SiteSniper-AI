import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Roast Any Website, Generate Cold Emails";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030712",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "60%",
            background: "radial-gradient(ellipse, rgba(249,115,22,0.15), transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: "800",
              color: "white",
              boxShadow: "0 8px 32px rgba(249,115,22,0.3)",
            }}
          >
            S
          </div>
          <span style={{ fontSize: "56px", fontWeight: "800", letterSpacing: "-1px" }}>
            SiteSniper
            <span style={{ color: "#fb923c" }}>AI</span>
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "26px",
            color: "#9ca3af",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
            zIndex: 1,
          }}
        >
          {title}
        </p>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          <span>sitesniper.ai</span>
          <div
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "#4b5563",
            }}
          />
          <span>Powered by Gemini AI</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
