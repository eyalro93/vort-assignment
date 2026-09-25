import { ImageResponse } from "next/og";
import { getReferralCard } from "@/lib/respondents";
import { trackLabel, levelLabel } from "@/lib/tracks";
import { loadHeeboFont } from "@/lib/og-font";

export const alt = "Vort — כמה אתם שווים";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const card = await getReferralCard(token);

  const [heeboRegular, heeboBold] = await Promise.all([
    loadHeeboFont(400),
    loadHeeboFont(800),
  ]);

  const headline = card ? `בטופ ${card.topPercent}%` : "כמה אתם שווים?";
  const subline = card
    ? `${levelLabel(card.track, card.level)} · ${trackLabel(card.track)} בישראל`
    : "בנצ׳מרק שכר לאנשי תקשורת ומדיה בישראל";

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

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontSize: 140,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#2B2326",
            }}
          >
            {headline}
          </span>
          <span style={{ fontSize: 32, fontWeight: 400, color: "#4A3940" }}>
            {subline}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "#76696D",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#E9638F",
              display: "flex",
            }}
          />
          <span>בדקו גם אתם כמה אתם שווים</span>
        </div>
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
