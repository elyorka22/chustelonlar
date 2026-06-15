"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { UploadBox } from "@/components/mobile/upload-box";
import { DISTRICTS, MAP_CENTER } from "@/lib/constants";
import { submitAd } from "@/lib/actions";
import { toast } from "sonner";
import type { CategoryData } from "@/types";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-48 shimmer rounded-[20px]" /> }
);

const STEPS = [
  { id: 1, label: "Asosiy ma'lumot" },
  { id: 2, label: "Rasmlar" },
  { id: 3, label: "Joylashuv" },
];

interface UploadedImage {
  fullUrl: string;
  thumbUrl: string;
}

export function CreateAdMobile({ categories }: { categories: CategoryData[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [location, setLocation] = useState({ lat: MAP_CENTER.lat, lng: MAP_CENTER.lng });
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    district: "",
    phone: "",
    telegram: "",
    negotiable: false,
  });

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Max 20MB");
        continue;
      }
      setUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const xhr = new XMLHttpRequest();
        const result = await new Promise<UploadedImage>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => xhr.status === 200 ? resolve(JSON.parse(xhr.responseText)) : reject();
          xhr.onerror = reject;
          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });
        setImages((prev) => [...prev, result]);
      } catch {
        toast.error("Xatolik");
      } finally {
        setUploading(false);
      }
    }
  }, []);

  const canProceed = () => {
    if (step === 1) return form.title && form.description && form.category && form.price && form.district && form.phone;
    if (step === 2) return images.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await submitAd({
      title: form.title,
      description: form.description,
      category: form.category,
      price: form.negotiable ? 0 : parseFloat(form.price),
      latitude: location.lat,
      longitude: location.lng,
      district: form.district,
      phone: form.phone,
      telegram: form.telegram || undefined,
      imageIds: images.map((img) => img.fullUrl),
    });
    setLoading(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("E'lon yuborildi!");
    router.push("/dashboard");
  };

  const inputClass =
    "h-[52px] w-full rounded-2xl bg-secondary px-4 text-[15px] font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen bg-secondary/30 pb-28">
      <MobileHeader title="E'lon joylash" showBack backHref="/" />

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 px-4 py-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold transition-all ${
                step >= s.id
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 rounded ${step > s.id ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-[13px] font-semibold text-gray-500">
        {STEPS[step - 1].label}
      </p>

      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Kategoriya</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Tanlang</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Sarlavha</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Masalan: Toyota Camry 2018"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Narx (so&apos;m)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="1000000"
                  disabled={form.negotiable}
                  className={inputClass}
                />
                <label className="mt-2 flex items-center gap-2 text-[13px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.negotiable}
                    onChange={(e) => setForm({ ...form, negotiable: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  Kelishiladi
                </label>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Tavsif</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Batafsil ma'lumot..."
                  rows={5}
                  className="w-full rounded-2xl bg-secondary px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Tuman</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Tanlang</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Telefon</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">Telegram (ixtiyoriy)</label>
                <input
                  value={form.telegram}
                  onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                  placeholder="username"
                  className={inputClass}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <UploadBox
                images={images}
                uploading={uploading}
                progress={uploadProgress}
                onUpload={handleImageUpload}
                onRemove={(i) => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="mb-3 text-[13px] text-gray-500">
                Xaritada joyni bosing yoki marker ni sudrab oling
              </p>
              <LocationPicker
                lat={location.lat}
                lng={location.lng}
                onChange={(lat, lng) => setLocation({ lat, lng })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          {step < 3 ? (
            <button
              onClick={() => canProceed() ? setStep(step + 1) : toast.error("Barcha maydonlarni to'ldiring")}
              disabled={!canProceed()}
              className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              Davom etish
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Yuborilmoqda...</> : "E'lonni joylash"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
