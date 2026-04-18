import type { ReactNode } from "react";

export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass-card ${className}`.trim()}>{children}</div>;
}
