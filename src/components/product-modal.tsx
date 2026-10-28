"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { CartIcon, CheckIcon, CloseIcon, MinusIcon, NoteIcon, PlusIcon } from "@/components/icons";
import type { MenuAddon, MenuProduct } from "@/lib/types";
import { formatBRL } from "@/lib/store";

type Props = {
  product: MenuProduct | null;
  addons: MenuAddon[];
  onClose: () => void;
  onAdded?: (message: string) => void;
};

export function ProductModal({ product, addons, onClose, onAdded }: Props) {
  const { addItem } = useCart();
  const [sizeId, setSizeId] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!product) return;
    const preferred = product.sizes.find((size) => size.id === "m") ?? product.sizes[0];
    setSizeId(preferred?.id ?? "");
    setSelected([]);
    setQuantity(1);
    setNotes("");
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  const grouped = useMemo(() => {
    if (!product?.addonScope) return [] as { group: string; items: MenuAddon[] }[];
    const filtered = addons.filter((addon) => addon.scope === product.addonScope);
    const map = new Map<string, MenuAddon[]>();
    for (const addon of filtered) {
      const bucket = map.get(addon.group) ?? [];
      bucket.push(addon);
      map.set(addon.group, bucket);
    }
    return [...map.entries()].map(([group, items]) => ({ group, items }));
  }, [addons, product]);

  if (!product) return null;

  const size = product.sizes.find((entry) => entry.id === sizeId) ?? product.sizes[0];
  const chosenAddons = addons.filter((addon) => selected.includes(addon.id));
  const addonsTotal = chosenAddons.reduce((sum, addon) => sum + addon.priceCents, 0);
  const unitPriceCents = (size?.priceCents ?? 0) + addonsTotal;
  const totalCents = unitPriceCents * quantity;

  const toggleAddon = (id: number) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const handleAdd = () => {
    if (!product.available || !size) return;
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPriceCents,
      addons: chosenAddons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        priceCents: addon.priceCents,
      })),
      notes: notes.trim(),
    });
    onAdded?.(`${quantity}× ${product.name} (${size.label}) no carrinho`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="animate-pop-in relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[32px] bg-cream shadow-[0_40px_100px_rgba(0,0,0,0.5)] sm:rounded-[32px]"
      >
        <div className="grid flex-1 overflow-y-auto thin-scrollbar md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative min-h-52 bg-sand md:min-h-full">
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="size-full object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-10">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-tomato"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <h2 className="font-display text-3xl font-semibold leading-tight text-ink">
              {product.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{product.description}</p>

            {!product.available && (
              <p className="mt-4 rounded-2xl bg-tomato/10 px-4 py-3 text-sm font-semibold text-tomato">
                Este item esgotou hoje. Volte amanhã — a produção é limitada.
              </p>
            )}

            {product.sizes.length > 1 && (
              <>
                <h3 className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-ink/50">
                  Escolha o tamanho
                </h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {product.sizes.map((entry) => {
                    const active = entry.id === size?.id;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSizeId(entry.id)}
                        className={`rounded-2xl border-2 p-3 text-left transition-all ${
                          active
                            ? "border-tomato bg-tomato/8 shadow-[0_10px_24px_rgba(200,52,29,0.18)]"
                            : "border-ink/12 bg-mozzarella hover:border-ink/30"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-display text-base font-semibold text-ink">
                            {entry.label}
                          </span>
                          <span
                            className={`grid size-5 place-items-center rounded-full border-2 ${
                              active ? "border-tomato bg-tomato text-cream" : "border-ink/25"
                            }`}
                          >
                            {active && <CheckIcon className="size-3" strokeWidth={3} />}
                          </span>
                        </span>
                        <span className="mt-1 block text-[11px] font-medium text-ink/55">
                          {entry.detail}
                        </span>
                        <span className="mt-1.5 block text-sm font-bold text-ink">
                          {formatBRL(entry.priceCents)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {grouped.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-ink/50">
                  Adicionais
                </h3>
                {grouped.map((group) => (
                  <div key={group.group} className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-tomato/80">
                      {group.group}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.items.map((addon) => {
                        const active = selected.includes(addon.id);
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleAddon(addon.id)}
                            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
                              active
                                ? "border-basil bg-basil/12 text-basil"
                                : "border-ink/15 bg-mozzarella text-ink/75 hover:border-ink/35"
                            }`}
                          >
                            <span
                              className={`grid size-4 place-items-center rounded-full border ${
                                active ? "border-basil bg-basil text-cream" : "border-ink/30"
                              }`}
                            >
                              {active && <CheckIcon className="size-2.5" strokeWidth={3.4} />}
                            </span>
                            {addon.name}
                            <span className="text-xs font-bold text-ink/50">
                              +{formatBRL(addon.priceCents)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink/50">
                <NoteIcon className="size-4" />
                Observações para a cozinha
              </h3>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={240}
                rows={2}
                placeholder="Ex.: sem cebola, cortar em 16 pedaços, borda bem assada…"
                className="mt-2 w-full resize-none rounded-2xl border border-ink/15 bg-mozzarella px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-tomato"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-ink/10 bg-cream px-5 py-4 sm:px-7">
          <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-mozzarella p-1">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-sand disabled:opacity-40"
              disabled={quantity <= 1}
              aria-label="Diminuir quantidade"
            >
              <MinusIcon className="size-4" strokeWidth={2.2} />
            </button>
            <span className="w-8 text-center font-display text-lg font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(20, value + 1))}
              className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-sand disabled:opacity-40"
              disabled={quantity >= 20}
              aria-label="Aumentar quantidade"
            >
              <PlusIcon className="size-4" strokeWidth={2.2} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.available}
            className="flex flex-1 items-center justify-between gap-3 rounded-full bg-tomato px-6 py-4 text-base font-bold text-cream transition-all hover:bg-tomato-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/25"
          >
            <span className="flex items-center gap-2">
              <CartIcon className="size-5" strokeWidth={1.9} />
              Adicionar ao carrinho
            </span>
            <span>{formatBRL(totalCents)}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-sand"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
