export function Skeleton({
  className = ""
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-white/65 ${className}`.trim()}
    />
  );
}
