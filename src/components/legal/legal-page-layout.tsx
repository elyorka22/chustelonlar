import Link from "next/link";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { APP_NAME } from "@/lib/constants";

interface LegalPageLayoutProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, updatedAt, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white pb-10 md:pb-16">
      <MobileHeader title={title} showBack backHref="/" />

      <article className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-10">
        <p className="text-[13px] text-[#64748B]">
          Oxirgi yangilanish: {updatedAt} · {APP_NAME}
        </p>

        <div className="prose-legal mt-6 space-y-6 text-[15px] leading-relaxed text-[#334155]">
          {children}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-[#E2E8F0] pt-6 text-[13px] font-semibold">
          <Link href="/terms" className="text-primary hover:underline">
            Foydalanish shartlari
          </Link>
          <Link href="/privacy" className="text-primary hover:underline">
            Maxfiylik siyosati
          </Link>
          <Link href="/" className="text-[#64748B] hover:text-primary">
            Bosh sahifa
          </Link>
        </div>
      </article>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[17px] font-extrabold text-[#0F172A]">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
