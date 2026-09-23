export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-4">
      {children}
    </div>
  );
}
