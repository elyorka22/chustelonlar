"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Phone,
  Send,
  Heart,
  Share2,
  Flag,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { SellerCard } from "@/components/mobile/seller-card";
import { AdCardGrid } from "@/components/mobile/ad-card-grid";
import { DialogRoot, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { toggleAdFavorite, submitReport } from "@/lib/actions";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { AdWithImages, CategoryData } from "@/types";
import { findCategory } from "@/lib/category-helpers";

const MiniMap = dynamic(
  () => import("@/components/mobile/mobile-map-view").then((m) => m.MiniMap),
  { ssr: false, loading: () => <div className="h-44 shimmer rounded-[20px]" /> }
);

interface AdDetailMobileProps {
  ad: AdWithImages;
  similarAds: AdWithImages[];
  isFavorited: boolean;
  categories?: CategoryData[];
}

export function AdDetailMobile({
  ad,
  similarAds,
  isFavorited: initialFavorited,
  categories = [],
}: AdDetailMobileProps) {
  const { data: session } = useSession();
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [reportReason, setReportReason] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  const category = findCategory(categories, ad.category);

  const handleFavorite = async () => {
    if (!session) { toast.error("Avval tizimga kiring"); return; }
    const result = await toggleAdFavorite(ad.id);
    if (result.error) { toast.error(result.error); return; }
    if ("favorited" in result) {
      setFavorited(result.favorited);
      toast.success(result.favorited ? "Saqlanganlar" : "Olib tashlandi");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: ad.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Havola nusxalandi");
    }
  };

  const handleReport = async () => {
    const result = await submitReport(ad.id, reportReason);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Shikoyat yuborildi");
    setReportOpen(false);
  };

  return (
    <div className="bg-secondary/30 pb-28">
      <MobileHeader showBack backHref="/ads" />

      {/* Image carousel */}
      <div className="relative aspect-[4/3] bg-white">
        {ad.images[activeImage] ? (
          <Image
            src={ad.images[activeImage].fullUrl}
            alt={ad.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            {category?.emoji}
          </div>
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={handleFavorite}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md"
          >
            <Heart className={`h-5 w-5 ${favorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {ad.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-white px-4 py-3 no-scrollbar">
          {ad.images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl ${
                i === activeImage ? "ring-2 ring-primary" : ""
              }`}
            >
              <Image src={img.thumbUrl} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4 px-4 pt-4">
        {/* Title & Price */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] bg-white p-4 card-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[18px] font-bold leading-snug text-gray-900">
              {ad.title}
            </h1>
            {ad.price === 0 && (
              <span className="flex-shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                Kelishiladi
              </span>
            )}
          </div>
          <p className="mt-2 text-[28px] font-extrabold text-primary">
            {formatPrice(ad.price)}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-[13px] text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {ad.district}
            </span>
            <span>{category?.emoji} {category?.label}</span>
            <span>{formatRelativeDate(ad.createdAt)}</span>
            <span>{ad.views} ko&apos;rish</span>
          </div>
        </motion.div>

        {/* Description */}
        <div className="rounded-[20px] bg-white p-4 card-shadow">
          <h2 className="text-[15px] font-bold text-gray-900">Tavsif</h2>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-600">
            {ad.description}
          </p>
        </div>

        <SellerCard
          name={ad.createdBy.name}
          image={ad.createdBy.image}
          joinedAt={ad.createdAt}
        />

        <div className="rounded-[20px] bg-white p-4 card-shadow">
          <h2 className="mb-3 text-[15px] font-bold text-gray-900">Joylashuv</h2>
          <MiniMap latitude={ad.latitude} longitude={ad.longitude} />
        </div>

        {similarAds.length > 0 && (
          <div>
            <h2 className="mb-3 text-[16px] font-bold">O&apos;xshash e&apos;lonlar</h2>
            <div className="grid grid-cols-2 gap-3">
              {similarAds.map((s, i) => (
                <AdCardGrid key={s.id} ad={s} categories={categories} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md md:bottom-0">
        <div className="mx-auto flex max-w-lg gap-2">
          <a
            href={`tel:${ad.phone}`}
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
          >
            <Phone className="h-5 w-5" />
            Qo&apos;ng&apos;iroq
          </a>
          {ad.telegram && (
            <a
              href={`https://t.me/${ad.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-white text-[15px] font-bold text-primary active:scale-[0.98] transition-transform"
            >
              <Send className="h-5 w-5" />
              Telegram
            </a>
          )}
          <DialogRoot open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <button className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-secondary">
                <Flag className="h-5 w-5 text-gray-500" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Shikoyat</DialogTitle>
              <Textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Sababini yozing..."
                className="mt-4"
                rows={4}
              />
              <button
                onClick={handleReport}
                className="mt-4 h-[52px] w-full rounded-2xl bg-primary font-bold text-white"
              >
                Yuborish
              </button>
            </DialogContent>
          </DialogRoot>
        </div>
      </div>
    </div>
  );
}
