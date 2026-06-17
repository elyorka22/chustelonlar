import { AdListSkeleton } from "@/components/mobile/shimmer";
import { MobileHeader } from "@/components/mobile/mobile-header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-secondary/40">
      <MobileHeader title="E'lonlar" />
      <div className="flex gap-2.5 px-4 pt-2 pb-2">
        <div className="h-[52px] w-[52px] shrink-0 shimmer rounded-2xl" />
        <div className="h-[52px] flex-1 shimmer rounded-2xl" />
      </div>
      <div className="px-4 py-4">
        <div className="mb-3 h-4 w-28 shimmer rounded-lg" />
        <AdListSkeleton />
      </div>
    </div>
  );
}
