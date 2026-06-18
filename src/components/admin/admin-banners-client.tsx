"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { AdminHeader } from "./admin-header";
import { isActionError } from "@/lib/action-result";
import {
  adminDeletePromoBanner,
  adminRemovePromoBannerImage,
  adminSavePromoBanner,
  adminUpdatePromoBannerImage,
} from "@/lib/actions";
import { PROMO_BANNER_BG_OPTIONS } from "@/lib/promo-banner-constants";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PromoBannerData } from "@/types";

interface AdminBannersClientProps {
  banners: PromoBannerData[];
  notificationCount: number;
}

type BannerDraft = {
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  bgClass: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

const emptyDraft: BannerDraft = {
  title: "",
  subtitle: "",
  href: "/ads",
  ctaLabel: "Ko'rish",
  bgClass: PROMO_BANNER_BG_OPTIONS[0].value,
  imageUrl: null,
  sortOrder: 0,
  isActive: true,
};

function validateImageFile(file: File): boolean {
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error("Rasm hajmi 20MB dan oshmasligi kerak");
    return false;
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast.error("Faqat JPG, PNG, WEBP formatlari qabul qilinadi");
    return false;
  }
  return true;
}

async function uploadBannerImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    toast.error(data.error || "Yuklashda xatolik");
    return null;
  }

  return data.fullUrl as string;
}

function BannerPreview({
  title,
  subtitle,
  bgClass,
  imageUrl,
  unoptimized = false,
  className,
  badge,
}: {
  title: string;
  subtitle: string;
  bgClass: string;
  imageUrl: string | null;
  unoptimized?: boolean;
  className?: string;
  badge?: ReactNode;
}) {
  const hasText = Boolean(title.trim() || subtitle.trim());

  return (
    <div
      className={cn(
        "relative min-h-[112px] overflow-hidden rounded-[18px]",
        className
      )}
    >
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="400px"
            unoptimized={unoptimized}
          />
          {hasText ? (
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
          ) : null}
        </>
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", bgClass)} />
      )}

      {hasText ? (
        <div className="relative z-10 px-4 py-4">
          {title.trim() ? (
            <p className="max-w-[75%] text-[14px] font-extrabold leading-snug text-white drop-shadow-sm">
              {title}
            </p>
          ) : null}
          {subtitle.trim() ? (
            <p className="mt-0.5 max-w-[75%] text-[11px] font-medium text-white/90 drop-shadow-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      {badge}
    </div>
  );
}

export function AdminBannersClient({
  banners: initialBanners,
  notificationCount,
}: AdminBannersClientProps) {
  const [banners, setBanners] = useState(initialBanners);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const createFileRef = useRef<HTMLInputElement | null>(null);

  const clearImagePick = () => {
    setImageFile(null);
    setImagePreview(null);
    if (createFileRef.current) createFileRef.current.value = "";
  };

  const resetForm = () => {
    setDraft({
      ...emptyDraft,
      sortOrder: banners.length,
    });
    setEditingId(null);
    setShowForm(false);
    clearImagePick();
  };

  const startEdit = (banner: PromoBannerData) => {
    setDraft({
      title: banner.title,
      subtitle: banner.subtitle,
      href: banner.href,
      ctaLabel: banner.ctaLabel,
      bgClass: banner.bgClass,
      imageUrl: banner.imageUrl,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    });
    setEditingId(banner.id);
    clearImagePick();
    setShowForm(true);
  };

  const handleImagePick = (file: File) => {
    if (!validateImageFile(file)) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleQuickUpload = async (bannerId: string, file: File) => {
    if (!validateImageFile(file)) return;

    setUploadingId(bannerId);
    try {
      const imageUrl = await uploadBannerImage(file);
      if (!imageUrl) {
        setUploadingId(null);
        return;
      }

      startTransition(async () => {
        const result = await adminUpdatePromoBannerImage(bannerId, imageUrl);
        setUploadingId(null);
        if (isActionError(result)) {
          toast.error(result.error);
          return;
        }

        setBanners((prev) =>
          prev.map((b) => (b.id === bannerId ? { ...b, imageUrl } : b))
        );
        toast.success("Banner rasmi yangilandi");
      });
    } catch {
      setUploadingId(null);
      toast.error("Yuklashda xatolik");
    }
  };

  const handleRemoveImage = (bannerId: string) => {
    startTransition(async () => {
      const result = await adminRemovePromoBannerImage(bannerId);
      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, imageUrl: null } : b))
      );
      toast.success("Rasm olib tashlandi");
    });
  };

  const handleSave = () => {
    const hasText = Boolean(draft.title.trim() || draft.subtitle.trim());
    if (!hasText && !draft.imageUrl && !imageFile) {
      toast.error("Matnsiz banner uchun rasm yuklang");
      return;
    }

    startTransition(async () => {
      let imageUrl = draft.imageUrl;

      if (imageFile) {
        setUploadingId("save");
        imageUrl = await uploadBannerImage(imageFile);
        setUploadingId(null);
        if (!imageUrl) return;
      }

      const formData = new FormData();
      if (editingId) formData.set("id", editingId);
      formData.set("title", draft.title);
      formData.set("subtitle", draft.subtitle);
      formData.set("href", draft.href);
      formData.set("ctaLabel", draft.ctaLabel);
      formData.set("bgClass", draft.bgClass);
      formData.set("imageUrl", imageUrl || "");
      formData.set("sortOrder", String(draft.sortOrder));
      formData.set("isActive", String(draft.isActive));

      const result = await adminSavePromoBanner(formData);
      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }

      toast.success(editingId ? "Banner yangilandi" : "Banner qo'shildi");
      resetForm();
      window.location.reload();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Banner o'chirilsinmi?")) return;

    startTransition(async () => {
      const result = await adminDeletePromoBanner(id);
      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner o'chirildi");
    });
  };

  const inputClass =
    "h-11 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] font-medium outline-none ring-1 ring-[#E2E8F0] focus:ring-primary/30";

  const previewUrl = imagePreview || draft.imageUrl;

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 px-4 pb-8"
      >
        <div className="flex items-start justify-between gap-3 pt-2">
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A]">Bannerlar</h1>
            <p className="mt-0.5 text-sm text-[#64748B]">
              Bosh sahifa karuseli — rasm, matn va havola
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDraft({ ...emptyDraft, sortOrder: banners.length });
              setEditingId(null);
              clearImagePick();
              setShowForm(true);
            }}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 text-[13px] font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Qo&apos;shish
          </button>
        </div>

        {showForm && (
          <section className="rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
            <h2 className="text-[15px] font-extrabold text-[#0F172A]">
              {editingId ? "Bannerni tahrirlash" : "Yangi banner"}
            </h2>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-[12px] font-semibold text-[#64748B]">
                  Sarlavha <span className="font-normal text-[#94A3B8]">(ixtiyoriy)</span>
                </span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className={cn(inputClass, "mt-1")}
                  placeholder="Masalan: Chegirmalar"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold text-[#64748B]">
                  Qisqa matn <span className="font-normal text-[#94A3B8]">(ixtiyoriy)</span>
                </span>
                <input
                  value={draft.subtitle}
                  onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                  className={cn(inputClass, "mt-1")}
                  placeholder="Masalan: Faqat bugun"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#64748B]">Havola</span>
                  <input
                    value={draft.href}
                    onChange={(e) => setDraft({ ...draft, href: e.target.value })}
                    className={cn(inputClass, "mt-1")}
                    placeholder="/ads"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#64748B]">Tugma matni</span>
                  <input
                    value={draft.ctaLabel}
                    onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
                    className={cn(inputClass, "mt-1")}
                    placeholder="Ko'rish"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#64748B]">Fon rangi</span>
                  <select
                    value={draft.bgClass}
                    onChange={(e) => setDraft({ ...draft, bgClass: e.target.value })}
                    className={cn(inputClass, "mt-1")}
                  >
                    {PROMO_BANNER_BG_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#64748B]">Tartib</span>
                  <input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className={cn(inputClass, "mt-1")}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-[14px] font-medium text-[#0F172A]">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Faol (bosh sahifada ko&apos;rsatish)
              </label>

              <div>
                <span className="text-[12px] font-semibold text-[#64748B]">
                  Banner rasmi (butun fon)
                </span>
                <div className="mt-2">
                  <BannerPreview
                    title={draft.title}
                    subtitle={draft.subtitle}
                    bgClass={draft.bgClass}
                    imageUrl={previewUrl}
                    unoptimized={!!imagePreview}
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={uploadingId === "save" || isPending}
                    onClick={() => createFileRef.current?.click()}
                    className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary/10 text-[12px] font-bold text-primary disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {imageFile || draft.imageUrl ? "Boshqasini tanlash" : "Rasm yuklash"}
                  </button>
                  {(imageFile || draft.imageUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        clearImagePick();
                        setDraft((prev) => ({ ...prev, imageUrl: null }));
                      }}
                      className="flex h-11 items-center justify-center rounded-2xl bg-rose-50 px-4 text-[12px] font-bold text-rose-600"
                    >
                      Olib tashlash
                    </button>
                  )}
                </div>
                <input
                  ref={createFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImagePick(file);
                  }}
                />
                <p className="mt-1.5 text-[11px] text-[#94A3B8]">
                  JPG, PNG yoki WEBP, maks. 20MB
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || uploadingId === "save"}
                  className="h-11 flex-1 rounded-2xl bg-primary text-[14px] font-bold text-white disabled:opacity-50"
                >
                  {uploadingId === "save" ? "Yuklanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-11 rounded-2xl bg-[#F8FAFC] px-4 text-[14px] font-semibold text-[#64748B] ring-1 ring-[#E2E8F0]"
                >
                  Bekor
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="space-y-3">
          {banners.length === 0 && (
            <div className="rounded-[22px] bg-white p-8 text-center text-[#64748B] shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
              Hozircha bannerlar yo&apos;q. &quot;Qo&apos;shish&quot; tugmasini bosing.
            </div>
          )}

          {banners.map((banner) => (
            <div
              key={banner.id}
              className="overflow-hidden rounded-[22px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
            >
              <BannerPreview
                title={banner.title}
                subtitle={banner.subtitle}
                bgClass={banner.bgClass}
                imageUrl={banner.imageUrl}
                className="min-h-[112px] rounded-none"
                badge={
                  !banner.isActive ? (
                    <span className="absolute left-3 top-3 z-20 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white">
                      Yashirin
                    </span>
                  ) : !banner.imageUrl ? (
                    <div className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/50">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  ) : null
                }
              />

              <div className="flex flex-wrap items-center gap-2 p-3">
                <input
                  ref={(el) => {
                    fileRefs.current[banner.id] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleQuickUpload(banner.id, file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingId === banner.id || isPending}
                  onClick={() => fileRefs.current[banner.id]?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F8FAFC] px-3 py-2 text-[12px] font-bold text-primary ring-1 ring-[#E2E8F0] disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingId === banner.id ? "Yuklanmoqda..." : "Rasm yuklash"}
                </button>
                {banner.imageUrl && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRemoveImage(banner.id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Rasmni olib tashlash
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(banner)}
                  className="rounded-xl bg-primary/10 px-3 py-2 text-[12px] font-bold text-primary"
                >
                  Tahrirlash
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(banner.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  O&apos;chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
