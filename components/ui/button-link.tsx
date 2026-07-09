import Link from "next/link";
import type { ComponentProps } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

function ButtonLink({ variant, size, className, children, ...linkProps }: ButtonLinkProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      nativeButton={false}
      render={<Link {...linkProps} />}
    >
      {children}
    </Button>
  );
}

export { ButtonLink };
