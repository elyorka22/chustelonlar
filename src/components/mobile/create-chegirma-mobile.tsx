"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { InsufficientCoinsModal } from "@/components/mobile/insufficient-coins-modal";
import { MonetkaIcon } from "@/components/ui/monetka-icon";
import { MAP_CENTER, DISTRICTS } from "@/lib/constants";
import { CHEGIRMA_CATEGORIES } from "@/lib/chegirma-constants";
import { submitChegirma, getChegirmaCostPreview } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-48 shimmer rounded-[20px]" /> }
);

const STEPS = [
  { id: 1, label: "Aksiya ma'lumoti" },
  { id: 2, label: "Do'kon joylashuvi" },
];

export function CreateChegirmaMobile({ initialBalance = 0 }: { initialBalance?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: MAP_CENTER.lat, lng: MAP_CENTER.lng });
  const [listingCost, setListingCost] = useState<{ required: number; balance: number } | null>(
    null
  );
  const [insufficientModal, setInsufficientModal] = useState<{
    balance: number;
    required: number;
    contact: { telegram: string | null; phone: string | null; whatsapp: string | null };
  } | null>(null);

  const [form, setForm] = useState({
    businessName: "",
    title: "",
    description: "",
    discountLabel: "",
    category: "food" as (typeof CHEGIRMA_CATEGORIES)[number]["value"],
    district: "Markaz",
    address: "",
    phone: "",
    telegram: "",
    validUntil: "",
  });

  const loadCost = useCallback(async () => {
    const preview = await getChegirmaCostPreview();
    if ("success" in preview && preview.success) {
      setListingCost({ required: preview.required, balance: preview.balance });
    }
  }, []);

  useEffect(() => {
    void loadCost();
  }, [loadCost]);

  const handleImageUpload = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Max 20MB");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Xatolik");
        return;
      }
      setImageUrl(data.fullUrl);
      toast.success("Banner yuklandi");
    } catch {
      toast.error("Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const canProceedStep1 =
    form.businessName &&
    form.title &&
    form.description &&
    form.discountLabel &&
    form.phone &&
    form.validUntil &&
    imageUrl;

  const handleSubmit = async () => {
    if (!imageUrl) {
      toast.error("Banner rasmini yuklang");
      setStep(1);
      return;
    }

    setLoading(true);
    const result = await submitChegirma({
      businessName: form.businessName,
      title: form.title,
      description: form.description,
      discountLabel: form.discountLabel,
      category: form.category,
      imageUrl,
      latitude: location.lat,
      longitude: location.lng,
      district: form.district,
      address: form.address || undefined,
      phone: form.phone,
      telegram: form.telegram || undefined,
      validUntil: new Date(form.validUntil),
    });
    setLoading(false);

    if (result.error) {
      if (result.code === "INSUFFICIENT_COINS") {
        setInsufficientModal({
          balance: result.balance ?? initialBalance,
          required: result.required ?? listingCost?.required ?? 0,
          contact: result.contact ?? { telegram: null, phone: null, whatsapp: null },
        });
        return;
      }
      toast.error(result.error);
      return;
    }

    toast.success("Aksiya moderatsiyaga yuborildi!");
    router.push("/dashboard");
  };

  const inputClass =
    "h-[52px] w-full rounded-2xl bg-white px-4 text-[15px] font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary/20";

  return (
    <div className="min-h-screen bg-secondary/30 pb-28">
      <MobileHeader title="Aksiya joylash" showBack backHref="/chegirmalar" />

      <div className="flex items-center justify-center gap-2 px-4 py-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold",
                step >= s.id ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              )}
            >
              {s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-8 rounded", step > s.id ? "bg-primary" : "bg-gray-200")} />
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
              key="s1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <input
                placeholder="Do'kon / biznes nomi *"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Aksiya sarlavhasi *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
              <textarea
                placeholder="Aksiya tavsifi *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-2xl bg-white px-4 py-3 text-[15px] font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary/20"
              />
              <input
                placeholder="Chegirma (masalan: -30%, 2+1) *"
                value={form.discountLabel}
                onChange={(e) => setForm({ ...form, discountLabel: e.target.value })}
                className={inputClass}
              />

              <div>
                <p className="mb-2 text-[13px] font-semibold text-gray-700">Kategoriya</p>
                <div className="grid grid-cols-3 gap-2">
                  {CHEGIRMA_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value })}
                      className={cn(
                        "rounded-2xl px-2 py-3 text-center text-[12px] font-bold",
                        form.category === cat.value
                          ? "bg-primary/10 text-primary ring-2 ring-primary"
                          : "bg-white text-gray-600 ring-1 ring-gray-200"
                      )}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <p className="mt-1">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className={inputClass}
                min={new Date().toISOString().split("T")[0]}
              />

              <input
                placeholder="Telefon *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Telegram (ixtiyoriy)"
                value={form.telegram}
                onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                className={inputClass}
              />

              <div>
                <p className="mb-2 text-[13px] font-semibold text-gray-700">Banner rasmi *</p>
                <div className="relative h-40 overflow-hidden rounded-[20px] bg-white ring-1 ring-gray-200">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="" fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <label className="mt-2 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary/10 text-[13px] font-bold text-primary">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImageUpload(file);
                    }}
                  />
                </label>
              </div>

              {listingCost && listingCost.required > 0 && (
                <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800">
                  <MonetkaIcon className="h-5 w-5" />
                  Joylash: {listingCost.required} monetka (balans: {listingCost.balance})
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-[13px] text-gray-600">
                Do&apos;koningiz joylashuvini xaritada belgilang — mijozlar aksiyani xaritada
                ko&apos;rishadi.
              </p>

              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className={inputClass}
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <input
                placeholder="Manzil (ixtiyoriy)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass}
              />

              <LocationPicker
                lat={location.lat}
                lng={location.lng}
                onChange={(lat, lng) => setLocation({ lat, lng })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-[calc(var(--nav-height)+12px)] left-4 right-4 z-30">
        {step < 2 ? (
          <button
            type="button"
            disabled={!canProceedStep1}
            onClick={() => {
              if (!canProceedStep1) {
                toast.error("Barcha maydonlarni to'ldiring");
                return;
              }
              setStep(2);
            }}
            className="h-[52px] w-full rounded-2xl bg-primary text-[15px] font-bold text-white disabled:opacity-50"
          >
            Keyingi
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yuborish"}
          </button>
        )}
      </div>

      {insufficientModal && (
        <InsufficientCoinsModal
          open
          onClose={() => setInsufficientModal(null)}
          balance={insufficientModal.balance}
          required={insufficientModal.required}
          contact={insufficientModal.contact}
        />
      )}
    </div>
  );
}
