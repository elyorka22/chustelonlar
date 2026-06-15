import { notFound } from "next/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl">🔍</div>
      <h1 className="mt-4 text-3xl font-bold">Sahifa topilmadi</h1>
      <p className="mt-2 text-gray-500">
        Siz qidirayotgan sahifa mavjud emas yoki o&apos;chirilgan
      </p>
      <a
        href="/"
        className="mt-6 rounded-xl bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 transition-colors"
      >
        Bosh sahifaga qaytish
      </a>
    </div>
  );
}
