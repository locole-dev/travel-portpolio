import type { ReactNode } from "react";

export function Field({
  label,
  help,
  children
}: {
  label: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-plum">{label}</span>
      {children}
      {help ? <span className="text-xs text-ink/60">{help}</span> : null}
    </label>
  );
}
