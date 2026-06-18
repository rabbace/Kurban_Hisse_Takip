import { Phone } from "lucide-react";

export default function StickyCallBar() {
  return (
    <a
      href="tel:+905001234567"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 bg-red-700 py-3 text-sm font-semibold text-white shadow-lg sm:hidden"
    >
      <Phone size={16} />
      Hemen Ara
    </a>
  );
}
