"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import {
  LogOut,
  Trash2,
  Save,
  KeyRound,
  User,
  Mail,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { updateProfile, updatePassword, deleteAccount } from "@/lib/actions";
import { PushNotificationSettings } from "@/components/pwa/push-notification-settings";
import { cn } from "@/lib/utils";

interface ProfileSettingsProps {
  user: {
    name: string | null;
    email: string;
    hasPassword: boolean;
  };
  onProfileUpdated: (name: string) => void;
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] bg-white ring-1 ring-[#E2E8F0]">
      <div className="border-b border-[#F1F5F9] px-4 py-3.5">
        <h3 className="text-[14px] font-extrabold text-[#0F172A]">{title}</h3>
        {description && (
          <p className="mt-0.5 text-[12px] text-[#64748B]">{description}</p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function ProfileSettings({ user, onProfileUpdated }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name || "");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteEmail, setDeleteEmail] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputClass =
    "h-[48px] w-full rounded-xl bg-[#F8FAFC] px-3.5 text-[14px] font-medium text-[#0F172A] outline-none ring-1 ring-[#E2E8F0] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-primary/25";

  const handleSaveProfile = () => {
    startTransition(async () => {
      const result = await updateProfile(name);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onProfileUpdated(name.trim());
      toast.success("Ma'lumotlar saqlandi");
    });
  };

  const handleChangePassword = () => {
    startTransition(async () => {
      const result = await updatePassword(passwordForm);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      toast.success("Parol yangilandi");
    });
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    startTransition(async () => {
      const result = await deleteAccount(deleteEmail);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Hisob o'chirildi");
      await signOut({ callbackUrl: "/" });
    });
  };

  return (
    <div className="space-y-3 pb-2">
      <SettingsSection
        title="Shaxsiy ma'lumotlar"
        description="Profil ko'rinishi va ismingiz"
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">
              <User className="h-3.5 w-3.5" />
              Ism
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ismingiz"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">
              <Mail className="h-3.5 w-3.5" />
              Email
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className={cn(inputClass, "cursor-not-allowed text-[#64748B]")}
            />
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveProfile}
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            O&apos;zgarishlarni saqlash
          </button>
        </div>
      </SettingsSection>

      {user.hasPassword && (
        <SettingsSection title="Xavfsizlik" description="Parol va kirish sozlamalari">
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex w-full items-center justify-between rounded-xl bg-[#F8FAFC] px-3.5 py-3 ring-1 ring-[#E2E8F0]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-[#E2E8F0]">
                <KeyRound className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[14px] font-semibold text-[#0F172A]">
                Parolni o&apos;zgartirish
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[#94A3B8] transition-transform",
                showPasswordForm && "rotate-180"
              )}
            />
          </button>

          {showPasswordForm && (
            <div className="mt-3 space-y-2.5">
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="Joriy parol"
                className={inputClass}
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="Yangi parol"
                className={inputClass}
              />
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Yangi parolni tasdiqlang"
                className={inputClass}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={handleChangePassword}
                className="flex h-[44px] w-full items-center justify-center rounded-xl bg-[#0F172A] text-[13px] font-bold text-white disabled:opacity-50"
              >
                Parolni yangilash
              </button>
            </div>
          )}
        </SettingsSection>
      )}

      <PushNotificationSettings />

      <SettingsSection title="Hisob">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl bg-[#F8FAFC] px-3.5 py-3.5 ring-1 ring-[#E2E8F0] active:scale-[0.99] transition-transform"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#0F172A]">Chiqish</p>
            <p className="text-[11px] text-[#64748B]">Hisobdan xavfsiz chiqish</p>
          </div>
        </button>
      </SettingsSection>

      <section className="overflow-hidden rounded-[18px] border border-red-200 bg-red-50/40 ring-1 ring-red-100">
        <div className="border-b border-red-100 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="text-[14px] font-extrabold text-red-800">Xavfli zona</h3>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-red-700/80">
            Hisobni o&apos;chirish — barcha e&apos;lonlar va ma&apos;lumotlar yo&apos;qoladi.
          </p>
        </div>

        <div className="p-4">
          {showDeleteConfirm && (
            <div className="mb-3 space-y-2">
              <p className="text-[12px] font-medium text-red-800">
                Tasdiqlash uchun email kiriting:{" "}
                <span className="font-bold">{user.email}</span>
              </p>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder={user.email}
                className={inputClass}
              />
            </div>
          )}

          <button
            type="button"
            disabled={isPending}
            onClick={handleDeleteAccount}
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-[14px] font-bold text-white disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {showDeleteConfirm ? "Hisobni butunlay o'chirish" : "Hisobni o'chirish"}
          </button>

          {showDeleteConfirm && (
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteEmail("");
              }}
              className="mt-2 w-full py-2 text-center text-[13px] font-semibold text-[#64748B]"
            >
              Bekor qilish
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
