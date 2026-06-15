import { AdGridSkeleton } from "@/components/mobile/shimmer";
import { MobileHeader } from "@/components/mobile/mobile-header";

export default function Loading() {
  return (
    <div className="bg-white">
      <MobileHeader />
      <div className="px-4 py-4">
        <AdGridSkeleton />
      </div>
    </div>
  );
}
