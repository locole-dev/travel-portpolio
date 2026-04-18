import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div className={`glass-card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
