export function ChoiceOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3.5 text-start transition-colors ${
        selected ? "border-coral" : "border-divider"
      }`}
    >
      <span
        className={`field-value ${selected ? "text-coral" : "text-ink"}`}
      >
        {label}
      </span>
      {selected && (
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-coral"
        />
      )}
    </button>
  );
}
