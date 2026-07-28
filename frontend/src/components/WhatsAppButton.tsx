export function WhatsAppButton() {
  const phone = "919876543210";
  const message = encodeURIComponent(
    "Hi DSA Lending Pro! I want to apply for a personal loan. Please help me."
  );
  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-2xl shadow-green-500/30 transition hover:scale-110 hover:bg-green-600"
      title="WhatsApp pe loan track karo"
    >
      💬
    </a>
  );
}
