export function Shimmer({ className }: { className?: string }) {
  return <div className={`shimmer rounded-2xl ${className || ""}`} />;
}

export function AdGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[20px] bg-white">
          <Shimmer className="aspect-[4/3] rounded-none" />
          <div className="space-y-2 p-3">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-5 w-2/3" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-[20px] bg-white p-3">
          <Shimmer className="h-[88px] w-[88px] flex-shrink-0" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-5 w-1/2" />
            <Shimmer className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
