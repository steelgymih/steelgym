import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-bg hover:bg-steel",
        outline:
          "border border-border-strong bg-transparent text-fg hover:bg-surface",
        ghost: "text-muted hover:text-fg hover:bg-surface",
        red: "bg-red text-fg hover:opacity-90",
        amber: "bg-amber text-bg hover:opacity-90",
      },
      size: {
        sm: "h-10 px-3.5 text-sm rounded-[var(--radius-sm)]",
        md: "h-11 px-5 text-sm rounded-[var(--radius-md)]",
        lg: "h-12 px-6 text-[0.9375rem] rounded-[var(--radius-md)]",
        xl: "h-14 px-7 text-base rounded-[var(--radius-lg)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
