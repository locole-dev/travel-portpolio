import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

function getVariantClass(variant: ButtonVariant) {
  if (variant === "secondary") {
    return "button-secondary";
  }

  if (variant === "danger") {
    return "button-danger";
  }

  return "button-primary";
}

type CommonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type LinkButtonProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const variantClass = getVariantClass(props.variant ?? "primary");

  if ("href" in props) {
    const { children, className = "", href, ...rest } = props;

    return (
      <a href={href} className={`${variantClass} ${className}`.trim()} {...rest}>
        {children}
      </a>
    );
  }

  const { children, className = "", type = "button", ...rest } = props;

  return (
    <button type={type} className={`${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
