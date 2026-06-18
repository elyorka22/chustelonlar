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
  Percent,
  Users,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "./admin-header";
import { SettingsRow } from "./settings-row";

interface AdminSettingsClientProps {
  notificationCount: number;
}

const comingSoon = () => toast.info("Tez orada qo'shiladi");

export function AdminSettingsClient({
  notificationCount,
}: AdminSettingsClientProps) {
  const sections = [
    {
      title: "Asosiy",
      items: [
        {
          icon: Info,
          title: "Dashboard",
          subtitle: "Asosiy ko'rsatkichlar",
          href: "/admin",
        },
        {
          icon: Tags,
          title: "Kategoriyalar",
          subtitle: "E'lon toifalari",
          href: "/admin/categories",
        },
        {
          icon: Percent,
          title: "Chegirmalar",
          subtitle: "Biznes aksiyalari",
          href: "/admin/chegirmalar",
        },
        {
          icon: Coins,
          title: "Monetka",
          subtitle: "Balans va narxlar",
          href: "/admin/monetization",
        },
        {
          icon: FileText,
          title: "E'lon moderatsiyasi",
          subtitle: "Kutilayotgan e'lonlar",
          href: "/admin/ads",
        },
        {
          icon: MapPin,
          title: "Hududlar",
          subtitle: "Chust tumanlari",
          onClick: comingSoon,
          disabled: true,
        },
        {
          icon: Upload,
          title: "Yuklash sozlamalari",
          subtitle: "Rasm va fayllar",
          onClick: comingSoon,
          disabled: true,
        },
      ],
    },
    {
      title: "Tizim",
      items: [
        {
          icon: Users,
          title: "Foydalanuvchilar",
          subtitle: "Rollar va bloklash",
          href: "/admin/users",
        },
        {
          icon: BarChart3,
          title: "Statistika",
          subtitle: "Analitika va grafiklar",
          href: "/admin/analytics",
        },
        {
          icon: Shield,
          title: "Shikoyatlar",
          subtitle: "Foydalanuvchi xabarlari",
          href: "/admin/reports",
        },
        {
          icon: Bell,
          title: "Bildirishnomalar",
          subtitle: "Push sozlamalari",
          onClick: comingSoon,
          disabled: true,
        },
        {
          icon: Lock,
          title: "Xavfsizlik",
          subtitle: "Parol va 2FA",
          onClick: comingSoon,
          disabled: true,
        },
        {
          icon: Database,
          title: "Zaxira nusxa",
          subtitle: "Backup va restore",
          onClick: comingSoon,
          disabled: true,
        },
      ],
    },
    {
      title: "Boshqa",
      items: [
        {
          icon: Globe,
          title: "Til",
          subtitle: "O'zbek tili",
          onClick: comingSoon,
          disabled: true,
        },
        {
          icon: LogOut,
          title: "Chiqish",
          subtitle: "Hisobdan chiqish",
          danger: true,
          onClick: () => signOut({ callbackUrl: "/" }),
        },
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
              {section.items.map((item) => (
                <SettingsRow
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  href={"href" in item ? item.href : undefined}
                  onClick={"onClick" in item ? item.onClick : undefined}
                  danger={"danger" in item && item.danger}
                  disabled={"disabled" in item && item.disabled}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
