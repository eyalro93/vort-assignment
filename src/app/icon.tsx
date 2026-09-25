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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FCFAFB",
        }}
      >
        <svg width={22} height={22} viewBox="0 0 100 100" fill="none">
          <path
            d="M34 92 L47.7 14"
            stroke="#E9638F"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <circle cx="72" cy="79" r="15" fill="#E9638F" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
