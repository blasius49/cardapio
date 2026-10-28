"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductCard } from "@/components/product-card";
import { ProductModal } from "@/components/product-modal";
import {
  ArrowRightIcon,
  CartIcon,
  CheckIcon,
  CloseIcon,
  PizzaIcon,
  SearchIcon,
  SparkIcon,
} from "@/components/icons";
import type { MenuPayload, MenuProduct } from "@/lib/types";
import { formatBRL } from "@/lib/store";

type SortKey = "recommended" | "price-asc" | "price-desc" | "name";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recomendados" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "name", label: "Nome (A-Z)" },
];

function fromPrice(product: MenuProduct) {
  return product.sizes.reduce(
    (min, size) => (size.priceCents < min ? size.priceCents : min),
    product.sizes[0]?.priceCents ?? 0,
  );
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function MenuExperience({ menu }: { menu: MenuPayload }) {
  const { openCart, count, subtotalCents } = useCart();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [active, setActive] = useState<string>(menu.categories[0]?.slug ?? "");
  const [selected, setSelected] = useState<MenuProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [toast]);

  const searching = query.trim().length > 1;

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    let list = menu.products;
    if (term) {
      list = list.filter((product) => {
        const haystack = normalize(
          [product.name, product.description, ...product.tags].join(" "),
        );
        return haystack.includes(term);
      });
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => fromPrice(a) - fromPrice(b));
    if (sort === "price-desc") sorted.sort((a, b) => fromPrice(b) - fromPrice(a));
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sort === "recommended")
      sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || Number(b.available) - Number(a.available),
      );
    return sorted;
  }, [menu.products, query, sort]);

  const featured = useMemo(
    () => menu.products.filter((product) => product.featured && product.available),
    [menu.products],
  );

  const sections = useMemo(
    () =>
      menu.categories
        .map((category) => ({
          category,
          items: filtered.filter((product) => product.categoryId === category.id),
        }))
        .filter((section) => section.items.length > 0),
    [filtered, menu.categories],
  );

  const visibleSection = searching ? sections[0]?.category.slug : active;

  useEffect(() => {
    if (searching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const category of menu.categories) {
      const element = document.getElementById(category.slug);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [menu.categories, searching]);

  const jumpTo = (slug: string) => {
    setQuery("");
    setActive(slug);
    const element = document.getElementById(slug);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 168;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ---------- Destaques ---------- */}
      <section id="destaques" className="scroll-mt-40 bg-mozzarella py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-tomato">
                <SparkIcon className="size-4" />
                saiu do forno
              </span>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-none tracking-tight">
                As mais pedidas da semana
              </h2>
              <p className="mt-3 max-w-xl text-ink/65">
                Ranking atualizado a cada pedido. Toque para escolher tamanho, adicionais e mandar
                recado para a cozinha.
              </p>
            </div>
            <button
              type="button"
              onClick={() => jumpTo(menu.categories[0]?.slug ?? "")}
              className="group hidden items-center gap-2 rounded-full border border-ink/20 px-5 py-3 text-sm font-bold text-ink transition-colors hover:border-tomato hover:text-tomato sm:flex"
            >
              Ver cardápio inteiro
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {featured.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelected(product)}
                className="group relative flex w-[290px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-cream text-left transition-all hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(28,18,16,0.18)]"
              >
                <span className="relative block aspect-[5/4] overflow-hidden bg-sand">
                  {product.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-cream text-tomato shadow-md transition-transform group-hover:rotate-12">
                    <PlusBadge />
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-xl font-semibold leading-tight">
                    {product.name}
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-sm text-ink/60">
                    {product.description}
                  </span>
                  <span className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                      a partir de
                    </span>
                    <span className="font-display text-xl font-semibold text-tomato">
                      {formatBRL(fromPrice(product))}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Cardápio ---------- */}
      <section id="cardapio" className="scroll-mt-40 bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-basil">
              <PizzaIcon className="size-4" />
              cardápio completo
            </span>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,4.4vw,3.4rem)] font-semibold leading-none tracking-tight">
              Monte o seu pedido
            </h2>
            <p className="mt-3 text-ink/65">
              {menu.products.length} itens · pizzas em três tamanhos, adicionais à vontade e bebidas
              geladas. Preços já com impostos.
            </p>
          </div>

          <div className="sticky top-[104px] z-30 -mx-4 mt-8 border-y border-ink/10 bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-3xl sm:border sm:px-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
                {menu.categories.map((category) => {
                  const total = menu.products.filter((p) => p.categoryId === category.id).length;
                  const isActive = !searching && visibleSection === category.slug;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => jumpTo(category.slug)}
                      className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                        isActive
                          ? "bg-ink text-cream shadow-[0_10px_22px_rgba(28,18,16,0.22)]"
                          : "bg-sand/70 text-ink-soft hover:bg-sand"
                      }`}
                    >
                      {category.name}
                      <span
                        className={`rounded-full px-1.5 text-[11px] ${
                          isActive ? "bg-cream/20 text-cream" : "bg-cream text-ink/55"
                        }`}
                      >
                        {total}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 lg:ml-auto">
                <label className="relative flex flex-1 items-center lg:w-64 lg:flex-none">
                  <SearchIcon className="pointer-events-none absolute left-3.5 size-4 text-ink/45" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar sabor…"
                    className="w-full rounded-full border border-ink/15 bg-mozzarella py-2.5 pl-10 pr-9 text-sm font-medium outline-none transition-colors placeholder:text-ink/40 focus:border-tomato"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Limpar busca"
                      className="absolute right-3 grid size-5 place-items-center rounded-full bg-sand text-ink/60 hover:bg-ink/15"
                    >
                      <CloseIcon className="size-3" strokeWidth={3} />
                    </button>
                  )}
                </label>

                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="rounded-full border border-ink/15 bg-mozzarella px-4 py-2.5 text-sm font-semibold text-ink outline-none transition-colors focus:border-tomato"
                  aria-label="Ordenar por"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {searching && (
            <p className="mt-6 text-sm font-semibold text-ink/60">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"} para “{query.trim()}”
            </p>
          )}

          {filtered.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-ink/20 bg-mozzarella p-12 text-center">
              <PizzaIcon className="mx-auto size-10 text-ink/25" />
              <p className="mt-4 font-display text-2xl font-semibold">Nada encontrado por aqui</p>
              <p className="mt-2 text-ink/60">
                Tente “mussarela”, “doce” ou limpe a busca para ver o cardápio inteiro.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSort("recommended");
                }}
                className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream hover:bg-tomato"
              >
                Limpar filtros
              </button>
            </div>
          )}

          <div className="mt-10 space-y-16">
            {sections.map(({ category, items }) => (
              <div key={category.id} id={category.slug} className="scroll-mt-56">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink/10 pb-4">
                  <div>
                    <h3 className="font-display text-3xl font-semibold leading-none tracking-tight">
                      {category.name}
                    </h3>
                    {category.tagline && (
                      <p className="mt-2 text-sm text-ink/60">{category.tagline}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-sand px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/60">
                    {items.length} {items.length === 1 ? "opção" : "opções"}
                  </span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} onOpen={setSelected} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Barra flutuante mobile ---------- */}
      {count > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
          <button
            type="button"
            onClick={openCart}
            className="animate-pop-in flex w-full items-center justify-between gap-3 rounded-full bg-ink px-5 py-4 text-cream shadow-[0_20px_45px_rgba(28,18,16,0.4)]"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-tomato">
                <CartIcon className="size-4.5" strokeWidth={1.9} />
              </span>
              <span className="text-left">
                <span className="block text-sm font-bold">
                  {count} {count === 1 ? "item" : "itens"}
                </span>
                <span className="block text-xs text-cream/60">Ver carrinho</span>
              </span>
            </span>
            <span className="font-display text-lg font-semibold">{formatBRL(subtotalCents)}</span>
          </button>
        </div>
      )}

      {/* ---------- Toast ---------- */}
      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 hidden -translate-x-1/2 lg:block">
          <div className="animate-pop-in flex items-center gap-3 rounded-full bg-basil px-5 py-3 text-sm font-bold text-cream shadow-[0_18px_40px_rgba(47,107,58,0.4)]">
            <span className="grid size-6 place-items-center rounded-full bg-cream/20">
              <CheckIcon className="size-3.5" strokeWidth={3} />
            </span>
            {toast}
          </div>
        </div>
      )}

      <ProductModal
        product={selected}
        addons={menu.addons}
        onClose={() => setSelected(null)}
        onAdded={setToast}
      />
    </>
  );
}

function PlusBadge() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}
