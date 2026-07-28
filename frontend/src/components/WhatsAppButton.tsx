import { BRAND } from "@/lib/brand";
import { IconWhatsApp } from "@/components/icons";

const phone = BRAND.whatsapp;
const message = encodeURIComponent(
  `Hi ${BRAND.name}, I would like assistance with a personal loan application.`
);

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-green-600/30 transition hover:scale-105"
      title="Chat with us on WhatsApp"
      aria-label="WhatsApp support"
    >
      <IconWhatsApp size={28} />
    </a>
  );
}
