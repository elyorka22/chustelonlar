export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { SearchBar } from "@/components/mobile/search-bar";
import { CategoryCard } from "@/components/mobile/category-card";
import { AdCardGrid } from "@/components/mobile/ad-card-grid";
import { getLatestAds } from "@/lib/services/ads";
import { getActiveCategories } from "@/lib/services/categories";

export default async function HomePage() {
  let latestAds: Awaited<ReturnType<typeof getLatestAds>> = [];
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];

  try {
    [latestAds, categories] = await Promise.all([
      getLatestAds(8),
      getActiveCategories(),
    ]);
  } catch {
    // DB unavailable
  }

  return (
    <div className="bg-white md:bg-secondary/30">
      <MobileHeader />

      {/* Hero */}
      <section className="px-4 pt-2 pb-6">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-gray-900 md:text-4xl">
          Chustdagi eng yaxshi e&apos;lonlar platformasi
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
          Avtomobillar, ko&apos;chmas mulk, buyumlar va boshqa e&apos;lonlar — barchasi bir joyda
        </p>

        <Link
          href="/create"
          className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform duration-200 md:hidden"
        >
          <Plus className="h-5 w-5" />
          E&apos;lon joylash
        </Link>

        <div className="mt-4">
          <SearchBar placeholder="Nima qidiryapsiz?" />
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pb-6">
        <div className="grid grid-cols-4 gap-2.5 md:grid-cols-4 md:gap-4 md:max-w-2xl">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              emoji={cat.emoji}
              label={cat.shortLabel}
              href={`/ads?category=${cat.slug}`}
              iconBg={cat.iconBg}
              imageUrl={cat.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* Latest ads */}
      <section className="px-4 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-gray-900">Yangi e&apos;lonlar</h2>
          <Link href="/ads" className="text-[13px] font-semibold text-primary">
            Barchasi →
          </Link>
        </div>

        {latestAds.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {latestAds.map((ad, i) => (
              <AdCardGrid key={ad.id} ad={ad} categories={categories} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] bg-secondary py-12 text-center text-gray-500">
            Hozircha e&apos;lonlar yo&apos;q
          </div>
        )}
      </section>
    </div>
  );
}
