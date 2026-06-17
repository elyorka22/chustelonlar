"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select";
import { ProgressBar } from "@/components/ui/progress";
import { DISTRICTS, MAX_IMAGES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { MAP_CENTER } from "@/lib/constants";
import { submitAd } from "@/lib/actions";
import { toast } from "sonner";
import type { CategoryData } from "@/types";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-gray-200" /> }
);

interface UploadedImage {
  fullUrl: string;
  thumbUrl: string;
}

export function CreateAdForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [location, setLocation] = useState({
    lat: MAP_CENTER.lat,
    lng: MAP_CENTER.lng,
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    district: "",
    phone: "",
    telegram: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const remaining = MAX_IMAGES - images.length;
      const toUpload = Array.from(files).slice(0, remaining);

      for (const file of toUpload) {
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`${file.name} juda katta (max 20MB)`);
          continue;
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          toast.error(`${file.name} formati qo'llab-quvvatlanmaydi`);
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
              if (e.lengthComputable) {
                setUploadProgress(Math.round((e.loaded / e.total) * 100));
              }
            };

            xhr.onload = () => {
              if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                reject(new Error("Upload failed"));
              }
            };

            xhr.onerror = () => reject(new Error("Upload failed"));
            xhr.open("POST", "/api/upload");
            xhr.send(formData);
          });

          setImages((prev) => [...prev, result]);
          toast.success("Rasm yuklandi");
        } catch {
          toast.error("Rasm yuklashda xatolik");
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      }
    },
    [images.length]
  );

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Kamida 1 ta rasm yuklang");
      return;
    }

    if (!form.category) {
      toast.error("Kategoriyani tanlang");
      return;
    }

    setLoading(true);

    const result = await submitAd({
      title: form.title,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price),
      latitude: location.lat,
      longitude: location.lng,
      district: form.district,
      phone: form.phone,
      telegram: form.telegram || undefined,
      imageIds: images.map((img) => img.fullUrl),
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("E'lon yuborildi! Admin tasdiqlashini kuting.");
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Rasmlar (max {MAX_IMAGES} ta)</Label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
              <img src={img.thumbUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-primary hover:bg-primary/5 dark:border-gray-600">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="mt-1 text-xs text-gray-500">Yuklash</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {uploading && (
          <div className="space-y-1">
            <ProgressBar value={uploadProgress} />
            <p className="text-xs text-gray-500">Yuklanmoqda... {uploadProgress}%</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Sarlavha *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Masalan: Toyota Camry 2018"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Tavsif *</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="E'lon haqida batafsil ma'lumot..."
          rows={5}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Kategoriya *</Label>
          <SelectField
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
            options={categories.map((c) => ({
              value: c.slug,
              label: `${c.emoji} ${c.label}`,
            }))}
            placeholder="Kategoriya tanlang"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Narx (so&apos;m) *</Label>
          <Input
            id="price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="1000000"
            required
            min="0"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tuman *</Label>
          <SelectField
            value={form.district}
            onValueChange={(v) => setForm({ ...form, district: v })}
            options={DISTRICTS.map((d) => ({ value: d, label: d }))}
            placeholder="Tuman tanlang"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telegram">Telegram (ixtiyoriy)</Label>
        <Input
          id="telegram"
          value={form.telegram}
          onChange={(e) => setForm({ ...form, telegram: e.target.value })}
          placeholder="username"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Joylashuv *
        </Label>
        <LocationPicker
          lat={location.lat}
          lng={location.lng}
          onChange={(lat, lng) => setLocation({ lat, lng })}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading || uploading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Yuborilmoqda...
          </>
        ) : (
          "E'lonni joylash"
        )}
      </Button>
    </form>
  );
}
