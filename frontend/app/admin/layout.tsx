import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin · A-2-Z Ply City Center",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
