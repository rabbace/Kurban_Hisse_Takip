import { Phone } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { PHONE_TEL, WHATSAPP_URL } from "@/lib/contact";

export default function StickyCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex sm:hidden">
      <a
        href={`tel:${PHONE_TEL}`}
        className="flex flex-1 items-center justify-center gap-2 bg-red-700 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Phone size={16} />
        Hemen Ara
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-green-600 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <WhatsAppIcon size={16} />
        WhatsApp
      </a>
    </div>
  );
}
