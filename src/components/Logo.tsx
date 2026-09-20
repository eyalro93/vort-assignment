// Exact mark from the brand spec: a right-leaning coral stroke with a coral
// dot at its base, "Vort" in Heebo 800 beside it. Coral on white only --
// never recolored, never boxed.
export function Logo({ size = 24 }: { size?: number }) {
  const iconSize = size * 1.25;
  return (
    <span className="inline-flex items-center gap-3">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className="block shrink-0"
      >
        <path
          d="M34 92 L47.7 14"
          stroke="#E9638F"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <circle cx="72" cy="79" r="13" fill="#E9638F" />
      </svg>
      <span
        className="font-extrabold text-ink"
        style={{ fontSize: size, letterSpacing: "-0.04em" }}
      >
        Vort
      </span>
    </span>
  );
}
