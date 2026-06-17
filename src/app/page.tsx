export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { HomeSearchBar } from "@/components/mobile/home-search-bar";
import { PromoBanner } from "@/components/mobile/promo-banner";
import { CategoryGridCard } from "@/components/mobile/category-grid-card";
import { AdCardHorizontal } from "@/components/mobile/ad-card-horizontal";
import { AdCardGrid } from "@/components/mobile/ad-card-grid";
import { getLatestAds, getAds, getUserFavoriteIds } from "@/lib/services/ads";
import { getActiveCategories } from "@/lib/services/categories";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  let latestAds: Awaited<ReturnType<typeof getLatestAds>> = [];
  let allAds: Awaited<ReturnType<typeof getAds>>["data"] = [];
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];
  let favoriteIds: string[] = [];

  try {
    const session = await auth();
    const [latest, allResult, cats, favIds] = await Promise.all([
      getLatestAds(8),
      getAds({ limit: "50" }),
      getActiveCategories(),
      session?.user?.id ? getUserFavoriteIds(session.user.id) : Promise.resolve([]),
    ]);
    latestAds = latest;
    allAds = allResult.data;
    categories = cats;
    favoriteIds = favIds;
  } catch {
    // DB unavailable
  }

  const favoriteSet = new Set(favoriteIds);

  return (
    <div className="min-h-screen bg-white pb-safe md:bg-secondary/30">
      {/* Search */}
      <section className="sticky top-0 z-30 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-md md:static md:mx-auto md:max-w-2xl md:pt-6">
        <HomeSearchBar />
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
            icon="grid"
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
          <Link href="/ads" className="text-[13px] font-semibold text-primary">
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

      {/* All ads grid */}
      {allAds.length > 0 && (
        <section className="pt-4 pb-8 md:mx-auto md:max-w-4xl">
          <div className="mb-3 px-4">
            <h2 className="text-[18px] font-bold text-gray-900">
              Barcha e&apos;lonlar
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 px-4 md:grid-cols-4 md:gap-3">
            {allAds.map((ad, i) => (
              <AdCardGrid
                key={ad.id}
                ad={ad}
                categories={categories}
                index={i}
                favorited={favoriteSet.has(ad.id)}
              />
            ))}
          </div>

          <div className="mt-4 px-4 text-center">
            <Link
              href="/ads"
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
