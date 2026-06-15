import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[52px] w-full rounded-2xl bg-secondary px-4 text-[15px] font-medium transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
