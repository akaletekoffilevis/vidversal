import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Administration — Vidversal",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("vidversal_admin")?.value === "1";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AdminLogin />
      </div>
    );
  }

  return <AdminDashboard />;
}