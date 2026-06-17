"use client";

import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  Info,
  Tags,
  MapPin,
  FileText,
  Upload,
  Shield,
  Bell,
  Lock,
  Database,
  Globe,
  LogOut,
  Coins,
  Image as ImageIcon,
} from "lucide-react";
import { AdminHeader } from "./admin-header";
import { SettingsRow } from "./settings-row";

interface AdminSettingsClientProps {
  notificationCount: number;
}

export function AdminSettingsClient({
  notificationCount,
}: AdminSettingsClientProps) {
  const sections = [
    {
      title: "Asosiy",
      items: [
        { icon: Info, title: "Umumiy ma'lumot", subtitle: "Platforma sozlamalari" },
        { icon: Tags, title: "Kategoriyalar", subtitle: "E'lon toifalari", href: "/admin/categories" },
        { icon: ImageIcon, title: "Bannerlar", subtitle: "Bosh sahifa karuseli", href: "/admin/banners" },
        { icon: Coins, title: "Monetka", subtitle: "Balans va narxlar", href: "/admin/monetization" },
        { icon: MapPin, title: "Hududlar", subtitle: "Chust tumanlari" },
        { icon: FileText, title: "E'lon sozlamalari", subtitle: "Moderatsiya qoidalari" },
        { icon: Upload, title: "Yuklash sozlamalari", subtitle: "Rasm va fayllar" },
      ],
    },
    {
      title: "Tizim",
      items: [
        { icon: Shield, title: "Rollar", subtitle: "Admin va foydalanuvchi" },
        { icon: Bell, title: "Bildirishnomalar", subtitle: "Push va email" },
        { icon: Lock, title: "Xavfsizlik", subtitle: "Parol va 2FA" },
        { icon: Database, title: "Zaxira nusxa", subtitle: "Backup va restore" },
      ],
    },
    {
      title: "Boshqa",
      items: [
        { icon: Globe, title: "Til", subtitle: "O'zbek tili" },
        { icon: LogOut, title: "Chiqish", subtitle: "Hisobdan chiqish", danger: true },
      ],
    },
  ];

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 pb-4"
      >
        <h1 className="pt-2 text-xl font-extrabold text-[#0F172A]">Sozlamalar</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">Platformani boshqaring</p>

        <div className="mt-4 space-y-4">
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: si * 0.05 }}
              className="overflow-hidden rounded-[22px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
            >
              <p className="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                {section.title}
              </p>
              {section.items.map((item, i) => (
                <SettingsRow
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  href={"href" in item ? item.href : undefined}
                  danger={"danger" in item && item.danger}
                  index={i}
                  onClick={
                    item.title === "Chiqish"
                      ? () => signOut({ callbackUrl: "/" })
                      : undefined
                  }
                />
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
