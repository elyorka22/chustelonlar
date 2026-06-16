import { requireAdmin } from "@/lib/session";
import { AdminShell } from "@/components/admin/admin-shell";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <AdminShell>
      <div className="mx-auto max-w-lg">{children}</div>
    </AdminShell>
  );
}
