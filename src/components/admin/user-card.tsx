"use client";

import { Shield, ShieldOff, UserCog, UserMinus, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, cn } from "@/lib/utils";

interface UserCardProps {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: string;
  adsCount: number;
  createdAt: Date;
  onBan?: (id: string) => void;
  onUnban?: (id: string) => void;
  onMakeAdmin?: (id: string) => void;
  onMakeModerator?: (id: string) => void;
  onRemoveModerator?: (id: string) => void;
  onMakeBusiness?: (id: string) => void;
  onRemoveBusiness?: (id: string) => void;
  loading?: boolean;
  index?: number;
}

function getInitials(name: string | null, email: string) {
  if (name) return name.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function roleBadge(role: string) {
  if (role === "ADMIN") return { label: "Admin", className: "bg-primary/10 text-primary" };
  if (role === "MODERATOR") return { label: "Moderator", className: "bg-[#8B5CF6]/10 text-[#8B5CF6]" };
  if (role === "BUSINESS") return { label: "Biznes", className: "bg-amber-500/10 text-amber-700" };
  if (role === "BANNED") return { label: "Ban", className: "bg-[#EF4444]/10 text-[#EF4444]" };
  return { label: "Faol", className: "bg-[#22C55E]/10 text-[#22C55E]" };
}

const actionBtn =
  "flex h-10 items-center justify-center gap-1 rounded-xl text-xs font-bold touch-manipulation active:scale-[0.97] transition-transform disabled:pointer-events-none disabled:opacity-50";

export function UserCard({
  id,
  name,
  email,
  image,
  role,
  adsCount,
  createdAt,
  onBan,
  onUnban,
  onMakeAdmin,
  onMakeModerator,
  onRemoveModerator,
  onMakeBusiness,
  onRemoveBusiness,
  loading = false,
}: UserCardProps) {
  const badge = roleBadge(role);

  return (
    <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-sm font-bold text-primary">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            getInitials(name, email)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-[#0F172A]">{name || "Nomsiz"}</p>
              <p className="text-xs text-[#64748B]">{email}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", badge.className)}>
              {badge.label}
            </span>
          </div>
          <div className="mt-2 flex gap-3 text-xs text-[#94A3B8]">
            <span>{adsCount} e&apos;lon</span>
            <span>·</span>
            <span>{formatRelativeDate(createdAt)}</span>
          </div>
        </div>
      </div>

      {role === "BANNED" && (
        <div className="mt-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => onUnban?.(id)}
            className={cn(actionBtn, "w-full bg-[#22C55E]/10 text-[#22C55E]")}
          >
            <ShieldOff className="h-4 w-4" />
            Unban
          </button>
        </div>
      )}

      {role === "USER" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => onBan?.(id)}
            className={cn(actionBtn, "bg-[#EF4444]/10 text-[#EF4444]")}
          >
            <Shield className="h-4 w-4" />
            Ban
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onMakeBusiness?.(id)}
            className={cn(actionBtn, "bg-amber-500/10 text-amber-700")}
          >
            <Store className="h-4 w-4" />
            Biznes
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onMakeModerator?.(id)}
            className={cn(actionBtn, "bg-[#8B5CF6]/10 text-[#8B5CF6]")}
          >
            <UserCog className="h-4 w-4" />
            Moderator
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onMakeAdmin?.(id)}
            className={cn(actionBtn, "bg-primary/10 text-primary")}
          >
            <UserCog className="h-4 w-4" />
            Admin
          </button>
        </div>
      )}

      {role === "BUSINESS" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => onBan?.(id)}
            className={cn(actionBtn, "bg-[#EF4444]/10 text-[#EF4444]")}
          >
            <Shield className="h-4 w-4" />
            Ban
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onRemoveBusiness?.(id)}
            className={cn(actionBtn, "bg-[#F1F5F9] text-[#64748B]")}
          >
            <UserMinus className="h-4 w-4" />
            Oddiy
          </button>
        </div>
      )}

      {role === "MODERATOR" && (
        <div className="mt-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => onRemoveModerator?.(id)}
            className={cn(actionBtn, "w-full bg-[#F1F5F9] text-[#64748B]")}
          >
            <UserMinus className="h-4 w-4" />
            Moderatorlikni olib tashlash
          </button>
        </div>
      )}

      {role === "ADMIN" && (
        <Badge variant="secondary" className="mt-3">
          Administrator
        </Badge>
      )}
    </div>
  );
}
