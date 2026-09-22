import { ImageResponse } from "next/og";
import { loadHeeboFont } from "@/lib/og-font";

export const alt = "Vort — כמה אתם שווים";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [heeboRegular, heeboBold] = await Promise.all([
    loadHeeboFont(400),
    loadHeeboFont(800),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#FCFAFB",
          fontFamily: "Heebo",
          direction: "rtl",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width={40} height={40} viewBox="0 0 100 100" fill="none">
            <path
              d="M34 92 L47.7 14"
              stroke="#E9638F"
              strokeWidth={12}
              strokeLinecap="round"
            />
            <circle cx="72" cy="79" r="13" fill="#E9638F" />
          </svg>
          <span style={{ fontSize: 32, fontWeight: 800, color: "#2B2326" }}>
            Vort
          </span>
        </div>

        <span
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#2B2326",
          }}
        >
          כמה אתם שווים?
        </span>

        <span style={{ fontSize: 28, color: "#76696D" }}>
          בנצ׳מרק שכר לאנשי תקשורת ומדיה בישראל
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Heebo", data: heeboRegular, style: "normal", weight: 400 },
        { name: "Heebo", data: heeboBold, style: "normal", weight: 800 },
      ],
    }
  );
}
