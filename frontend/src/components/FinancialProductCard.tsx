import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { IconArrowRight, IconClock, IconFile, IconShield } from "@/components/icons";

export type FinancialProduct = {
  slug: string;
  title: string;
  amount: string;
  rate: string;
  desc: string;
  features: string[];
  image: string;
  audience: string;
  speed: string;
  docs: string;
  accent: string;
};

export function FinancialProductCard({ product }: { product: FinancialProduct }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-neercred transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${product.accent} to-transparent`} />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Badge variant="gold" className="mb-2 bg-white/20 text-white backdrop-blur-sm">
            {product.audience}
          </Badge>
          <h2 className="text-xl font-bold tracking-tight">{product.title}</h2>
          <p className="text-sm text-white/85">{product.amount}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm leading-relaxed text-slate-600">{product.desc}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
            <IconClock size={14} className="shrink-0 text-neercred-teal" />
            <span>{product.speed}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
            <IconFile size={14} className="shrink-0 text-neercred-teal" />
            <span>{product.docs}</span>
          </div>
        </div>

        <p className="mt-4 text-sm font-bold text-neercred-teal">From {product.rate}</p>

        <ul className="mt-3 flex-1 space-y-2">
          {product.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-slate-500">
              <IconShield size={12} className="shrink-0 text-neercred-teal" />
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/apply"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-neercred-navy py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Check eligibility
          <IconArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
