import { requireStaff } from "@/lib/session";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStaffProvider } from "@/components/admin/admin-staff-context";
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
  const user = await requireStaff();

  return (
    <AdminStaffProvider role={user.role}>
      <AdminShell>
        <div className="mx-auto max-w-lg">{children}</div>
      </AdminShell>
    </AdminStaffProvider>
  );
}
