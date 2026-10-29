import { ImageResponse } from "next/og";
import { LOCALES, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const alt = "PS5 JB Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Pixel look without web fonts: no network at build time, and the face buttons are drawn as SVG.
export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(hasLocale(lang) ? lang : "en");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#0b0b14",
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(0,112,209,0.35), transparent 60%)",
          border: "16px solid #2de2e6",
          color: "#ecebff",
          fontFamily: "monospace",
        }}
      >
        <svg width="360" height="72" viewBox="0 0 360 72">
          <polygon points="36,6 66,62 6,62" fill="none" stroke="#40e0b0" strokeWidth="8" />
          <circle cx="132" cy="36" r="28" fill="none" stroke="#ff5a6e" strokeWidth="8" />
          <path d="M206 10 L254 62 M254 10 L206 62" stroke="#5aa9ff" strokeWidth="8" />
          <rect x="298" y="8" width="56" height="56" fill="none" stroke="#ff8ad8" strokeWidth="8" />
        </svg>
        <div style={{ fontSize: 96, fontWeight: 700, color: "#2de2e6", textShadow: "8px 8px 0 #06060c" }}>
          {dict.meta.title}
        </div>
        <div style={{ fontSize: 40, color: "#ffd23f", maxWidth: 1000, textAlign: "center" }}>
          {dict.header.tagline}
        </div>
      </div>
    ),
    size,
  );
}
