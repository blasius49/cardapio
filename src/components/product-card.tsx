"use client";

import { PlusIcon, SparkIcon } from "@/components/icons";
import type { MenuProduct } from "@/lib/types";
import { formatBRL } from "@/lib/store";

type Props = {
  product: MenuProduct;
  onOpen: (product: MenuProduct) => void;
};

export function ProductCard({ product, onOpen }: Props) {
  const from = product.sizes.reduce(
    (min, size) => (size.priceCents < min ? size.priceCents : min),
    product.sizes[0]?.priceCents ?? 0,
  );

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[28px] border bg-mozzarella transition-all duration-300 ${
        product.available
          ? "border-ink/10 hover:-translate-y-1.5 hover:border-tomato/40 hover:shadow-[0_28px_60px_rgba(28,18,16,0.16)]"
          : "border-ink/10 opacity-70"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`size-full object-cover transition-transform duration-700 group-hover:scale-[1.07] ${
              product.available ? "" : "grayscale"
            }`}
          />
        ) : (
          <div className="size-full bg-checker" />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-tomato backdrop-blur"
            >
              {tag}
            </span>
          ))}
          {product.featured && (
            <span className="flex items-center gap-1 rounded-full bg-crust px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
              <SparkIcon className="size-3" />
              destaque
            </span>
          )}
        </div>

        {!product.available && (
          <div className="absolute inset-0 grid place-items-center bg-ink/55">
            <span className="rounded-full bg-cream px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-tomato">
              esgotada hoje
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-tight text-ink">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/65">
          {product.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.sizes.map((size) => (
            <span
              key={size.id}
              className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold text-ink/70"
            >
              {size.label} {formatBRL(size.priceCents).replace("R$", "").trim()}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/45">
              a partir de
            </span>
            <span className="font-display text-2xl font-semibold text-ink">
              {formatBRL(from)}
            </span>
          </div>

          <button
            type="button"
            disabled={!product.available}
            onClick={() => onOpen(product)}
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-cream transition-all hover:bg-tomato active:scale-95 disabled:cursor-not-allowed disabled:bg-ink/25"
          >
            <PlusIcon className="size-4" strokeWidth={2.2} />
            {product.available ? "Adicionar" : "Indisponível"}
          </button>
        </div>
      </div>
    </article>
  );
}
