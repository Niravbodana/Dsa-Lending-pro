import Image from "next/image";
import Link from "next/link";

export function InnerHero({
  badge,
  title,
  subtitle,
  cta,
  image,
}: {
  badge?: string;
  title: string;
  subtitle: string;
  cta?: { label: string; href: string };
  image?: string;
}) {
  return (
    <section className="relative min-h-[320px] overflow-hidden bg-slate-900 py-20 text-white">
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-teal-900/85 to-cyan-900/75" />
        </>
      )}
      {!image && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900" />
      )}
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {badge && (
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold backdrop-blur">
            {badge}
          </span>
        )}
        <h1 className="mt-4 text-4xl font-black md:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-teal-100">{subtitle}</p>
        {cta && (
          <Link
            href={cta.href}
            className="mt-8 inline-block rounded-2xl bg-amber-400 px-8 py-4 font-extrabold text-slate-900 shadow-xl transition hover:scale-105"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
