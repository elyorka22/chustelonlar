import Link from "next/link";
import { HomeSearchBar } from "@/components/mobile/home-search-bar";
import { PromoBanner } from "@/components/mobile/promo-banner";
import { CategoryGridCard } from "@/components/mobile/category-grid-card";
import { AdCardHorizontal } from "@/components/mobile/ad-card-horizontal";
import { HomeFavoritesGrid } from "@/components/mobile/home-favorites-grid";
import {
  getCachedActiveCategories,
  getCachedLatestAds,
  getCachedHomeAdsGrid,
} from "@/lib/cached-data";

export const revalidate = 60;

export default async function HomePage() {
  let latestAds: Awaited<ReturnType<typeof getCachedLatestAds>> = [];
  let allAds: Awaited<ReturnType<typeof getCachedHomeAdsGrid>> = [];
  let categories: Awaited<ReturnType<typeof getCachedActiveCategories>> = [];

  const [latestResult, gridResult, categoriesResult] = await Promise.allSettled([
    getCachedLatestAds(8),
    getCachedHomeAdsGrid(),
    getCachedActiveCategories(),
  ]);

  if (latestResult.status === "fulfilled") {
    latestAds = latestResult.value;
  } else {
    console.error("[homepage] latest ads failed:", latestResult.reason);
  }

  if (gridResult.status === "fulfilled") {
    allAds = gridResult.value;
  } else {
    console.error("[homepage] ads grid failed:", gridResult.reason);
  }

  if (categoriesResult.status === "fulfilled") {
    categories = categoriesResult.value;
  } else {
    console.error("[homepage] categories failed:", categoriesResult.reason);
  }

  return (
    <div className="min-h-screen bg-white pb-safe md:bg-secondary/30">
      {/* Search */}
      <section className="sticky top-0 z-30 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-md md:static md:mx-auto md:max-w-2xl md:pt-6">
        <HomeSearchBar categories={categories} />
      </section>

      {/* Banner */}
      <section className="px-4 pt-1 md:mx-auto md:max-w-2xl">
        <PromoBanner />
      </section>

      {/* Categories — 3-column super-app grid */}
      <section className="px-4 pt-5 md:mx-auto md:max-w-2xl">
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map((cat) => (
            <CategoryGridCard
              key={cat.slug}
              label={cat.label}
              subtitle={cat.shortLabel}
              href={`/ads?category=${cat.slug}`}
              emoji={cat.emoji}
              imageUrl={cat.imageUrl}
            />
          ))}
          <CategoryGridCard
            label="Barchasi"
            subtitle="Ko'rish"
            href="/ads"
            emoji="🗂️"
          />
          {categories.length === 0 && (
            <>
              {["Avto", "Uy-joy", "Ish"].map((label) => (
                <div
                  key={label}
                  className="flex h-[108px] items-center justify-center rounded-[20px] bg-[#F4F4F5] text-sm text-gray-400"
                >
                  {label}
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Latest ads carousel */}
      <section className="pt-6 md:mx-auto md:max-w-4xl">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-[18px] font-bold text-gray-900">
            Yangi e&apos;lonlar
          </h2>
          <Link href="/ads" prefetch className="text-[13px] font-semibold text-primary">
            Barchasi →
          </Link>
        </div>

        {latestAds.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 snap-x snap-mandatory scrollbar-hide md:hidden">
            {latestAds.map((ad, i) => (
              <AdCardHorizontal
                key={ad.id}
                ad={ad}
                categories={categories}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-[20px] bg-secondary py-12 text-center text-gray-500">
            Hozircha e&apos;lonlar yo&apos;q
          </div>
        )}
      </section>

      {/* All ads grid — favorites loaded in parallel via Suspense */}
      {allAds.length > 0 && (
        <section className="pt-4 pb-8 md:mx-auto md:max-w-4xl">
          <div className="mb-3 px-4">
            <h2 className="text-[18px] font-bold text-gray-900">
              Barcha e&apos;lonlar
            </h2>
          </div>

          <HomeFavoritesGrid ads={allAds} categories={categories} />

          <div className="mt-4 px-4 text-center">
            <Link
              href="/ads"
              prefetch
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-secondary px-6 text-[13px] font-semibold text-gray-700"
            >
              Barcha e&apos;lonlarni ko&apos;rish
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
