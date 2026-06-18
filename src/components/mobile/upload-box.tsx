"use client";

import { Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/progress";
import { MAX_IMAGES } from "@/lib/constants";

interface UploadBoxProps {
  images: { thumbUrl: string }[];
  uploading: boolean;
  progress: number;
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
}

export function UploadBox({
  images,
  uploading,
  progress,
  onUpload,
  onRemove,
  maxImages = MAX_IMAGES,
}: UploadBoxProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
            <img src={img.thumbUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 active:bg-primary/10 transition-colors">
            <Upload className="h-6 w-6 text-primary" />
            <span className="mt-1 text-[10px] font-medium text-primary">Yuklash</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {images.length === 0 && (
        <motion.label
          whileTap={{ scale: 0.99 }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-gray-200 bg-secondary/50 py-10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white card-shadow">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-3 text-[15px] font-bold text-gray-900">Rasm yuklash</p>
          <p className="mt-1 text-[12px] text-gray-500">JPG, PNG, WEBP · Max 20MB</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
            disabled={uploading}
          />
        </motion.label>
      )}

      {uploading && (
        <div className="space-y-1">
          <ProgressBar value={progress} />
          <p className="text-center text-[12px] text-gray-500">
            Yuklanmoqda... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
