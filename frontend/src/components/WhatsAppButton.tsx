import { BRAND } from "@/lib/brand";

const phone = BRAND.whatsapp;
const message = encodeURIComponent(
  `Hi ${BRAND.name}! I want to apply for a personal loan. Please help me.`
);

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-2xl shadow-green-500/30 transition hover:scale-110 hover:bg-green-600"
      title="Chat with us on WhatsApp"
    >
      💬
    </a>
  );
}
