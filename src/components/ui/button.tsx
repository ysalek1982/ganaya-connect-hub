import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary/40 bg-transparent text-primary hover:bg-primary/10 hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
        ghost: "hover:bg-white/5 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary via-[hsl(160,80%,50%)] to-[hsl(140,75%,45%)] text-primary-foreground font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-100 border border-white/10",
        accent: "bg-gradient-to-r from-accent to-[hsl(45,90%,50%)] text-accent-foreground font-bold shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.02] active:scale-100",
        gold: "bg-gradient-to-r from-[hsl(38,92%,55%)] to-[hsl(45,90%,60%)] text-black font-bold shadow-xl shadow-[hsl(38,92%,55%)]/30 hover:shadow-[hsl(38,92%,55%)]/50 hover:scale-[1.02] active:scale-100",
        whatsapp: "bg-[#25D366] text-white font-bold shadow-lg shadow-[#25D366]/30 hover:bg-[#20c15a] hover:scale-[1.02] active:scale-100",
        glass: "backdrop-blur-xl border border-white/15 bg-white/5 text-foreground hover:bg-white/10 hover:border-white/25",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
