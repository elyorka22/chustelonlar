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

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-safe">
      <div className="px-4 pb-3 pt-3">
        <div className="flex gap-2.5">
          <Shimmer className="h-[52px] w-[52px] shrink-0" />
          <Shimmer className="h-[52px] flex-1" />
          <Shimmer className="h-[52px] w-[88px] shrink-0" />
        </div>
      </div>
      <div className="px-4 pt-1">
        <Shimmer className="h-[120px] w-full rounded-[20px]" />
      </div>
      <div className="grid grid-cols-3 gap-2.5 px-4 pt-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="h-[108px] rounded-[20px]" />
        ))}
      </div>
      <div className="mt-6 px-4">
        <Shimmer className="mb-3 h-5 w-32" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-[88px] w-[210px] shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-8">
      <Shimmer className="mx-auto mt-2 h-14 w-40 rounded-xl" />
      <div className="mx-4 mt-4">
        <Shimmer className="h-[220px] w-full rounded-[24px]" />
      </div>
      <div className="mx-4 mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-[88px] rounded-[16px]" />
        ))}
      </div>
      <div className="mx-4 mt-4">
        <Shimmer className="h-11 w-full rounded-[14px]" />
      </div>
      <div className="mx-4 mt-4 space-y-3">
        <Shimmer className="h-[52px] w-full rounded-[16px]" />
        <AdListSkeleton />
      </div>
    </div>
  );
}

export function AdDetailSkeleton() {
  return (
    <div className="min-h-screen bg-secondary/30 pb-8">
      <Shimmer className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 px-4 pt-4">
        <Shimmer className="h-6 w-3/4" />
        <Shimmer className="h-8 w-1/2" />
        <Shimmer className="h-24 w-full rounded-[20px]" />
        <Shimmer className="h-32 w-full rounded-[20px]" />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="bg-white">
      <Shimmer className="h-14 w-full rounded-none" />
      <Shimmer className="mx-4 mt-3 h-10 w-full rounded-2xl" />
      <Shimmer className="mt-3 h-[65vh] w-full rounded-none" />
    </div>
  );
}
