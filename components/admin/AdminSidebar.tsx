"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, PawPrint, Scissors, Tag, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/siparisler", label: "Siparişler", icon: List },
  { href: "/admin/hayvanlar", label: "Hayvanlar", icon: PawPrint },
  { href: "/admin/kesim", label: "Kesim Takvimi", icon: Scissors },
  { href: "/admin/etiketler", label: "QR Etiketler", icon: Tag },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/giris");
  }

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-emerald-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐑</span>
          <div>
            <p className="text-sm font-bold text-white">Kurban Takip</p>
            <p className="text-xs text-emerald-300">Admin Paneli</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-emerald-200 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-emerald-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-200 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-emerald-800 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐑</span>
          <p className="text-sm font-bold text-white">Admin Panel</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-white p-1"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="h-full w-64 bg-emerald-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-col bg-emerald-800 md:flex shrink-0">
        <NavContent />
      </aside>
    </>
  );
}
