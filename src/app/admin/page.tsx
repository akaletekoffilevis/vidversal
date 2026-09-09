import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Administration — Vidversal",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await auth();
  const isAdmin =
    cookieStore.get("vidversal_admin")?.value === "1" ||
    (session?.user as { role?: string } | undefined)?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AdminLogin />
      </div>
    );
  }

  return <AdminDashboard />;
}