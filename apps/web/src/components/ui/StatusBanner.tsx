export function StatusBanner({
  tone,
  message
}: {
  tone: "success" | "error" | "info";
  message: string;
}) {
  const toneClass =
    tone === "success"
      ? "border-leaf/60 bg-leaf/20 text-ink"
      : tone === "error"
        ? "border-pink/40 bg-pink/10 text-plum"
        : "border-sky/60 bg-sky/20 text-ink";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClass}`.trim()}>
      {message}
    </div>
  );
}
