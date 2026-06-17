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
  priceCurrency: "UZS" | "USD";
  priceNegotiable: boolean;
  latitude: number;
  longitude: number;
  district: string;
  phone: string;
  telegram: string | null;
  status: string;
  isPremium: boolean;
  isTop?: boolean;
  topUntil?: Date | null;
  isVip?: boolean;
  vipUntil?: Date | null;
  isUrgent?: boolean;
  urgentUntil?: Date | null;
  isPaused?: boolean;
  views: number;
  contactClicks?: number;
  listingCoinCost?: number;
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
  priceCurrency: "UZS" | "USD";
  priceNegotiable: boolean;
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
  pricingType?: "FREE" | "LIMITED_FREE" | "PAID";
  listingCoinCost?: number;
  freeLimit?: number;
}

export interface PromoBannerData {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageUrl: string | null;
  bgClass: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ChegirmaData {
  id: string;
  businessName: string;
  title: string;
  description: string;
  imageUrl: string;
  discountLabel: string;
  category: string;
  latitude: number;
  longitude: number;
  district: string;
  address: string | null;
  phone: string;
  telegram: string | null;
  validUntil: Date;
  status: string;
  views: number;
  createdAt: Date;
  createdBy?: {
    id: string;
    name: string | null;
  };
}

export interface MapChegirmaMarker {
  id: string;
  title: string;
  businessName: string;
  discountLabel: string;
  imageUrl: string;
  thumbUrl: string;
  latitude: number;
  longitude: number;
  district: string;
  validUntil: Date;
}

export interface UserDashboardStats {
  wallet: {
    coinBalance: number;
    totalCoinsPurchased: number;
    totalCoinsSpent: number;
  };
  transactions: {
    id: string;
    type: string;
    amount: number;
    description: string | null;
    createdAt: Date;
  }[];
  listings: {
    total: number;
    active: number;
    sold: number;
    expired: number;
  };
  engagement: {
    totalViews: number;
    favoritesCount: number;
    contactClicks: number;
    avgViewsPerListing: number;
  };
  coins: {
    spentOnPromotions: number;
    spentOnPublishing: number;
  };
  topListing: { id: string; title: string; views: number } | null;
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
