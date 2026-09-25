// A thin line is the structure; a small coral dot is the one emphasis.
// Used both for the free salary range (no personal marker yet) and the
// precise percentile result (marker = you).

export function RangeMeter({
  minLabel,
  maxLabel,
  markerPercent,
}: {
  minLabel: string;
  maxLabel: string;
  markerPercent?: number;
}) {
  return (
    <div>
      <div className="relative h-px bg-divider">
        {typeof markerPercent === "number" && (
          <span
            className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-coral"
            style={{ left: `${markerPercent}%`, transform: "translate(-50%, -50%)" }}
          />
        )}
      </div>
      <div className="mt-2 flex justify-between">
        <span className="field-label text-ink-muted">{minLabel}</span>
        <span className="field-label text-ink-muted">{maxLabel}</span>
      </div>
    </div>
  );
}

export function PercentileMeter({ percent }: { percent: number }) {
  return (
    <div>
      <div className="relative h-px bg-divider">
        <span
          className="absolute top-1/2 size-2.5 rounded-full bg-coral"
          style={{ left: `${percent}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        <span className="field-label text-ink-muted">0</span>
        <span className="field-label text-ink-muted">50</span>
        <span className="field-label text-ink-muted">100</span>
      </div>
    </div>
  );
}
