"use client";

import Link from "next/link";
import { Eye, Plus, CheckCircle, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { AD_STATUS_LABELS } from "@/lib/constants";
import { markAdSold, removeAd } from "@/lib/actions";
import { toast } from "sonner";
import type { AdWithImages } from "@/types";

interface DashboardClientProps {
  ads: AdWithImages[];
  stats: {
    total: number;
    approved: number;
    pending: number;
    sold: number;
    totalViews: number;
  };
}

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  SOLD: "secondary",
  DELETED: "destructive",
};

export function DashboardClient({ ads, stats }: DashboardClientProps) {
  const handleMarkSold = async (adId: string) => {
    const result = await markAdSold(adId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Sotilgan deb belgilandi");
    window.location.reload();
  };

  const handleDelete = async (adId: string) => {
    if (
      !confirm(
        "E'lonni o'chirmoqchimisiz? Rasmlar 24 soat ichida serverdan ham o'chiriladi."
      )
    ) {
      return;
    }
    const result = await removeAd(adId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("E'lon o'chirildi");
    window.location.reload();
  };

  const statCards = [
    { label: "Jami e'lonlar", value: stats.total, icon: Tag, color: "text-primary" },
    { label: "Tasdiqlangan", value: stats.approved, icon: CheckCircle, color: "text-green-500" },
    { label: "Kutilmoqda", value: stats.pending, icon: Clock, color: "text-yellow-500" },
    { label: "Ko'rishlar", value: stats.totalViews, icon: Eye, color: "text-blue-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shaxsiy kabinet</h1>
          <p className="mt-1 text-gray-500">E&apos;lonlaringizni boshqaring</p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="h-4 w-4" />
            Yangi e&apos;lon
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl bg-gray-100 p-3 dark:bg-gray-800 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Mening e&apos;lonlarim</h2>
        <div className="mt-4 space-y-4">
          {ads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Hali e&apos;lonlar yo&apos;q</p>
                <Button className="mt-4" asChild>
                  <Link href="/create">Birinchi e&apos;lonni joylash</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {ad.images[0] && (
                    <img
                      src={ad.images[0].thumbUrl}
                      alt=""
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{ad.title}</h3>
                      <Badge variant={statusVariant[ad.status] || "default"}>
                        {AD_STATUS_LABELS[ad.status]}
                      </Badge>
                    </div>
                    <p className="text-primary font-bold">
                      {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ad.views} ko&apos;rish · {formatRelativeDate(ad.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ad.status === "APPROVED" && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/ads/${ad.id}`}>Ko&apos;rish</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkSold(ad.id)}
                        >
                          Sotildi
                        </Button>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                    >
                      O&apos;chirish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
