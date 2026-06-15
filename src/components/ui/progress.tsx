"use client";

import * as Progress from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <Progress.Root
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
        className
      )}
      value={value}
    >
      <Progress.Indicator
        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${value}%` }}
      />
    </Progress.Root>
  );
}
