export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2" role="progressbar" aria-valuenow={step} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i < step ? "bg-coral" : "bg-divider"
          }`}
        />
      ))}
    </div>
  );
}
