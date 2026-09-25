// A row in a divided list, not a bordered box -- the brand spec is explicit
// that structure comes from thin lines, not panels. Selection is shown by
// the coral text + trailing dot only, never a colored border/fill.
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
      className="flex w-full items-center justify-between border-b border-divider py-4 text-start transition-colors"
    >
      <span className={`field-value ${selected ? "text-coral" : "text-ink"}`}>
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

export function ChoiceList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col border-t border-divider">{children}</div>;
}
