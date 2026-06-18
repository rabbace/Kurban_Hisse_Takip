"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Hayvanlar" },
    { href: "/takip", label: "Sipariş Takip" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-red-700 shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐑</span>
          <div>
            <p className="text-sm font-bold leading-tight text-white">Kurban</p>
            <p className="text-xs font-medium leading-tight text-red-200">Hisse Takip</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-white/15 text-white"
                  : "text-red-100 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://www.google.com/maps/search/?api=1&query=%C4%B0zgara%20%C4%B0zgara"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn hidden md:inline-flex"
            aria-label="Konum"
          >
            <MapPin size={17} />
          </a>
          <a href="tel:+905001234567" className="icon-btn hidden md:inline-flex" aria-label="Telefon">
            <Phone size={17} />
          </a>
          <Link href="/takip" className="btn-primary hidden bg-white text-xs text-red-700 hover:bg-red-50 md:inline-flex">
            <Search size={14} />
            Sipariş Sorgula
          </Link>
          <button
            className="rounded-full p-2 text-white hover:bg-white/10 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-red-700 px-4 pb-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium",
                pathname === link.href
                  ? "bg-white/15 text-white"
                  : "text-red-100 hover:bg-white/10"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=%C4%B0zgara%20%C4%B0zgara"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              aria-label="Konum"
            >
              <MapPin size={17} />
            </a>
            <a href="tel:+905001234567" className="icon-btn" aria-label="Telefon">
              <Phone size={17} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
