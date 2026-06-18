"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, ImageIcon, Plus, X } from "lucide-react";
import { AdminHeader } from "./admin-header";
import { CategoryGridCard } from "@/components/mobile/category-grid-card";
import {
  adminUpdateCategoryImage,
  adminRemoveCategoryImage,
  adminCreateCategory,
  adminDeleteCategory,
} from "@/lib/actions";
import { useAsyncAction } from "@/lib/use-async-action";
import { isActionError } from "@/lib/action-result";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CATEGORY_EMOJI_PRESETS,
  CATEGORY_ICON_BGS,
} from "@/lib/category-helpers";
import { CategoryEmoji } from "@/components/ui/category-emoji";
import type { CategoryData } from "@/types";

interface AdminCategoriesClientProps {
  categories: CategoryData[];
  notificationCount: number;
}

async function uploadCategoryImage(file: File): Promise<string | null> {
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

export function AdminCategoriesClient({
  categories: initialCategories,
  notificationCount,
}: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    label: "",
    shortLabel: "",
    emoji: "📦",
    iconBg: "bg-blue-100",
  });
  const { run, isLoading } = useAsyncAction();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const createFileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (slug: string, file: File) => {
    setUploading(slug);
    try {
      const imageUrl = await uploadCategoryImage(file);
      if (!imageUrl) return;

      const result = await adminUpdateCategoryImage(slug, imageUrl);
      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }
      setCategories((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, imageUrl } : c))
      );
      toast.success("Karta rasmi yangilandi");
    } catch {
      toast.error("Yuklashda xatolik");
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = (slug: string) => {
    run(`remove-image-${slug}`, () => adminRemoveCategoryImage(slug), {
      successMessage: "Emoji qaytarildi",
      onSuccess: () => {
        setCategories((prev) =>
          prev.map((c) => (c.slug === slug ? { ...c, imageUrl: null } : c))
        );
      },
    });
  };

  const resetCreateForm = () => {
    setForm({ label: "", shortLabel: "", emoji: "📦", iconBg: "bg-blue-100" });
    setCreateImageFile(null);
    setCreateImagePreview(null);
    if (createFileRef.current) createFileRef.current.value = "";
  };

  const handleCreateImagePick = (file: File) => {
    setCreateImageFile(file);
    setCreateImagePreview(URL.createObjectURL(file));
  };

  const handleCreate = () => {
    if (!form.label.trim() || !form.shortLabel.trim()) {
      toast.error("Nom va qisqa nom to'ldirilishi shart");
      return;
    }

    run("create-category", async () => {
      let imageUrl: string | null = null;

      if (createImageFile) {
        setUploading("new");
        imageUrl = await uploadCategoryImage(createImageFile);
        setUploading(null);
        if (!imageUrl) return { error: "Rasm yuklanmadi" };
      }

      const fd = new FormData();
      fd.append("label", form.label);
      fd.append("shortLabel", form.shortLabel);
      fd.append("emoji", form.emoji);
      fd.append("iconBg", form.iconBg);
      if (imageUrl) fd.append("imageUrl", imageUrl);

      const result = await adminCreateCategory(fd);
      if ("category" in result && result.category) {
        setCategories((prev) => [...prev, result.category!]);
      }
      resetCreateForm();
      setShowForm(false);
      return result;
    }, { successMessage: "Kategoriya yaratildi" });
  };

  const handleDelete = (slug: string, label: string) => {
    if (!confirm(`"${label}" kategoriyasini o'chirmoqchimisiz?`)) return;

    run(`delete-${slug}`, () => adminDeleteCategory(slug), {
      successMessage: "O'chirildi",
      onSuccess: () => {
        setCategories((prev) => prev.filter((c) => c.slug !== slug));
      },
    });
  };

  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 pb-4"
      >
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A]">Kategoriyalar</h1>
            <p className="mt-0.5 text-sm text-[#64748B]">
              Bosh sahifa kartochkalariga rasm qo&apos;ying
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex h-10 items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/25 touch-manipulation active:scale-[0.97]"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Yopish" : "Yangi"}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
            >
              <h3 className="mb-3 text-sm font-extrabold text-[#0F172A]">
                Yangi kategoriya
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="To'liq nom (masalan: Xizmatlar)"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="h-11 w-full rounded-2xl border-0 bg-[#F8FAFC] px-4 text-sm outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Qisqa nom (masalan: Xizmat)"
                  value={form.shortLabel}
                  onChange={(e) => setForm({ ...form, shortLabel: e.target.value })}
                  className="h-11 w-full rounded-2xl border-0 bg-[#F8FAFC] px-4 text-sm outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-primary/30"
                />

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#64748B]">Karta ko&apos;rinishi</p>
                  <CategoryGridCard
                    label={form.label || "Kategoriya"}
                    subtitle={form.shortLabel || "Qisqa nom"}
                    href="#"
                    emoji={form.emoji}
                    imageUrl={createImagePreview}
                    className="pointer-events-none max-w-[160px]"
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#64748B]">Karta rasmi (ixtiyoriy)</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => createFileRef.current?.click()}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary/10 text-xs font-bold text-primary touch-manipulation active:scale-[0.97]"
                    >
                      <Upload className="h-4 w-4" />
                      {createImageFile ? "Boshqasini tanlash" : "Rasm yuklash"}
                    </button>
                    {createImageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setCreateImageFile(null);
                          setCreateImagePreview(null);
                          if (createFileRef.current) createFileRef.current.value = "";
                        }}
                        className="flex h-11 items-center justify-center rounded-2xl bg-[#EF4444]/10 px-4 text-xs font-bold text-[#EF4444] touch-manipulation active:scale-[0.97]"
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
                      if (file) handleCreateImagePick(file);
                    }}
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#64748B]">Emoji (rasm bo&apos;lmasa)</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_EMOJI_PRESETS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setForm({ ...form, emoji })}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl text-xl",
                          form.emoji === emoji
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-[#F8FAFC]"
                        )}
                      >
                        <CategoryEmoji emoji={emoji} size={28} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#64748B]">Fon rangi</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_ICON_BGS.map((bg) => (
                      <button
                        key={bg.value}
                        type="button"
                        onClick={() => setForm({ ...form, iconBg: bg.value })}
                        className={cn(
                          "h-8 rounded-full px-3 text-xs font-semibold",
                          bg.value,
                          form.iconBg === bg.value && "ring-2 ring-primary ring-offset-1"
                        )}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading("create-category") || uploading === "new"}
                  onClick={handleCreate}
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white touch-manipulation disabled:opacity-50 active:scale-[0.98]"
                >
                  {uploading === "new" ? "Yuklanmoqda..." : "Kategoriya yaratish"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 space-y-4">
          {activeCategories.map((cat, i) => {
            const isUploading = uploading === cat.slug;

            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#0F172A]">{cat.label}</p>
                    <p className="text-xs text-[#64748B]">{cat.slug}</p>
                  </div>
                  {isUploading && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </div>

                <p className="mb-2 text-xs font-semibold text-[#64748B]">
                  Bosh sahifadagi ko&apos;rinishi
                </p>
                <CategoryGridCard
                  label={cat.label}
                  subtitle={cat.shortLabel}
                  href={`/ads?category=${cat.slug}`}
                  emoji={cat.emoji}
                  imageUrl={cat.imageUrl}
                  className="max-w-[180px]"
                />

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileRefs.current[cat.slug]?.click()}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary/10 text-xs font-bold text-primary touch-manipulation disabled:opacity-50 active:scale-[0.97]"
                  >
                    <Upload className="h-4 w-4" />
                    {cat.imageUrl ? "Rasmni almashtirish" : "Rasm qo'shish"}
                  </button>

                  {cat.imageUrl && (
                    <button
                      type="button"
                      disabled={isUploading || isLoading(`remove-image-${cat.slug}`)}
                      onClick={() => handleRemoveImage(cat.slug)}
                      className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#F59E0B]/10 text-xs font-bold text-[#F59E0B] touch-manipulation disabled:opacity-50 active:scale-[0.97]"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Emojiga qaytarish
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isLoading(`delete-${cat.slug}`)}
                    onClick={() => handleDelete(cat.slug, cat.label)}
                    className={cn(
                      "flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#EF4444]/10 text-xs font-bold text-[#EF4444] touch-manipulation disabled:opacity-50 active:scale-[0.97]",
                      cat.imageUrl ? "" : "col-span-2"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                    O&apos;chirish
                  </button>
                </div>

                <input
                  ref={(el) => {
                    fileRefs.current[cat.slug] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(cat.slug, file);
                    e.target.value = "";
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-[20px] bg-primary/5 p-4">
          <ImageIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-[#64748B]">
            PNG yoki WEBP formatidagi shaffof rasmlar yaxshi ko&apos;rinadi.
            Rasm yuklamasangiz, emoji ko&apos;rsatiladi. O&apos;zgarishlar bosh
            sahifada darhol paydo bo&apos;ladi.
          </p>
        </div>
      </motion.div>
    </>
  );
}
