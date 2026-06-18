"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { AdminHeader } from "./admin-header";
import { UserCard } from "./user-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminBanUser,
  adminUnbanUser,
  adminMakeAdmin,
  adminMakeModerator,
  adminRemoveModerator,
  adminMakeBusiness,
  adminRemoveBusiness,
} from "@/lib/actions";
import { useAsyncAction } from "@/lib/use-async-action";

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
  const { run, isLoading } = useAsyncAction();

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (tab === "active" && user.role !== "USER") return false;
      if (tab === "banned" && user.role !== "BANNED") return false;
      if (tab === "admin" && user.role !== "ADMIN") return false;
      if (tab === "moderator" && user.role !== "MODERATOR") return false;
      if (tab === "business" && user.role !== "BUSINESS") return false;
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

  const runUserAction = (
    userId: string,
    action: () => Promise<{ error?: string; success?: boolean }>,
    successMsg: string
  ) => {
    run(`user-${userId}`, action, { successMessage: successMsg, reload: true });
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
          <TabsList>
            <TabsTrigger value="all" className="text-xs">Barchasi</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Faol</TabsTrigger>
            <TabsTrigger value="banned" className="text-xs">Ban</TabsTrigger>
            <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
            <TabsTrigger value="moderator" className="text-xs">Moderator</TabsTrigger>
            <TabsTrigger value="business" className="text-xs">Biznes</TabsTrigger>
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
            filtered.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                email={user.email}
                image={user.image}
                role={user.role}
                adsCount={user._count.ads}
                createdAt={user.createdAt}
                loading={isLoading(`user-${user.id}`)}
                onBan={(id) =>
                  runUserAction(id, () => adminBanUser(id), "Foydalanuvchi bloklandi")
                }
                onUnban={(id) =>
                  runUserAction(id, () => adminUnbanUser(id), "Blokdan chiqarildi")
                }
                onMakeAdmin={(id) =>
                  runUserAction(id, () => adminMakeAdmin(id), "Admin qilindi")
                }
                onMakeModerator={(id) =>
                  runUserAction(id, () => adminMakeModerator(id), "Moderator qilindi")
                }
                onRemoveModerator={(id) =>
                  runUserAction(id, () => adminRemoveModerator(id), "Moderatorlik olib tashlandi")
                }
                onMakeBusiness={(id) =>
                  runUserAction(id, () => adminMakeBusiness(id), "Biznes akkaunt qilindi")
                }
                onRemoveBusiness={(id) =>
                  runUserAction(id, () => adminRemoveBusiness(id), "Oddiy hisobga qaytarildi")
                }
              />
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
