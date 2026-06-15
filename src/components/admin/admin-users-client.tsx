"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { AdminHeader } from "./admin-header";
import { UserCard } from "./user-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminBanUser,
  adminUnbanUser,
  adminMakeAdmin,
} from "@/lib/actions";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  _count: { ads: number };
}

interface AdminUsersClientProps {
  users: AdminUser[];
  notificationCount: number;
}

export function AdminUsersClient({
  users,
  notificationCount,
}: AdminUsersClientProps) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (tab === "active" && user.role !== "USER") return false;
      if (tab === "banned" && user.role !== "BANNED") return false;
      if (tab === "admin" && user.role !== "ADMIN") return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          user.email.toLowerCase().includes(q) ||
          (user.name?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [users, tab, search]);

  const runAction = (
    userId: string,
    action: () => Promise<{ error?: string; success?: boolean }>,
    successMsg: string
  ) => {
    setLoadingId(userId);
    startTransition(async () => {
      const result = await action();
      setLoadingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMsg);
      window.location.reload();
    });
  };

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 pb-4"
      >
        <h1 className="pt-2 text-xl font-extrabold text-[#0F172A]">Foydalanuvchilar</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">{users.length} ta foydalanuvchi</p>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="text-xs">Barchasi</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Faol</TabsTrigger>
            <TabsTrigger value="banned" className="text-xs">Ban</TabsTrigger>
            <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Foydalanuvchi qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl border-0 bg-white pl-10 pr-4 text-sm shadow-sm outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-[20px] bg-white py-12 text-center text-[#64748B]">
              Foydalanuvchilar topilmadi
            </div>
          ) : (
            filtered.map((user, i) => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                email={user.email}
                image={user.image}
                role={user.role}
                adsCount={user._count.ads}
                createdAt={user.createdAt}
                loading={loadingId === user.id}
                onBan={(id) =>
                  runAction(id, () => adminBanUser(id), "Foydalanuvchi bloklandi")
                }
                onUnban={(id) =>
                  runAction(id, () => adminUnbanUser(id), "Blokdan chiqarildi")
                }
                onMakeAdmin={(id) =>
                  runAction(id, () => adminMakeAdmin(id), "Admin qilindi")
                }
                index={i}
              />
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
