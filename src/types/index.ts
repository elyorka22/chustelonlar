import { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}

export interface AdWithImages {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  latitude: number;
  longitude: number;
  district: string;
  phone: string;
  telegram: string | null;
  status: string;
  isPremium: boolean;
  views: number;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
  images: {
    id: string;
    fullUrl: string;
    thumbUrl: string;
    order: number;
  }[];
  _count?: {
    favorites: number;
  };
}

export interface MapAdMarker {
  id: string;
  title: string;
  price: number;
  category: string;
  district: string;
  latitude: number;
  longitude: number;
  thumbUrl: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CategoryData {
  slug: string;
  label: string;
  shortLabel: string;
  emoji: string;
  iconBg: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AnalyticsData {
  totalUsers: number;
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  rejectedAds: number;
  totalViews: number;
  dailyGrowth: { date: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  viewsGrowth: { date: string; count: number }[];
  categoryStats: { category: string; count: number }[];
  districtStats: { district: string; count: number; percentage: number }[];
}
