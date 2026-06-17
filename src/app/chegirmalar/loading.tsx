import { MobileHeader } from "@/components/mobile/mobile-header";

export default function ChegirmalarLoading() {
  return (
    <div className="min-h-screen bg-secondary/40">
      <MobileHeader title="Chegirmalar" />
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    </div>
  );
}
