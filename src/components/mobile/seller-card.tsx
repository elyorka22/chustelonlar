import { formatDate } from "@/lib/utils";

interface SellerCardProps {
  name: string | null;
  image: string | null;
  joinedAt: Date | string;
}

export function SellerCard({ name, image, joinedAt }: SellerCardProps) {
  return (
    <div className="rounded-[20px] bg-white p-4 card-shadow">
      <p className="mb-3 text-[13px] font-semibold text-gray-500">Sotuvchi</p>
      <div className="flex items-center gap-3">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-12 w-12 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
            {name?.[0] || "?"}
          </div>
        )}
        <div>
          <p className="text-[15px] font-bold text-gray-900">
            {name || "Foydalanuvchi"}
          </p>
          <p className="text-[13px] text-gray-500">
            {formatDate(joinedAt)} dan beri
          </p>
        </div>
      </div>
    </div>
  );
}
