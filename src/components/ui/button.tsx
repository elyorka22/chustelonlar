import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 rounded-2xl",
        secondary: "bg-secondary text-gray-900 hover:bg-gray-200 rounded-2xl",
        outline: "border-2 border-primary bg-white text-primary hover:bg-primary/5 rounded-2xl",
        ghost: "hover:bg-secondary rounded-2xl",
        destructive: "bg-red-500 text-white hover:bg-red-600 rounded-2xl",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[52px] px-6 text-[15px]",
        sm: "h-10 rounded-xl px-4 text-[13px]",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
