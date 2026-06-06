import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin | Kurban Takip" };

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!DEMO) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/giris");
  }

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
