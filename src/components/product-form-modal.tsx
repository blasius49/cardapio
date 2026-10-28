"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  CloseIcon,
  PizzaIcon,
  PlusIcon,
  SparkIcon,
  TrashIcon,
} from "@/components/icons";
import type { MenuCategory, MenuProduct } from "@/lib/types";
import { formatBRL } from "@/lib/store";

type SizeDraft = { id: string; label: string; detail: string; price: string };

type Props = {
  open: boolean;
  pin: string;
  categories: MenuCategory[];
  product: MenuProduct | null;
  onClose: () => void;
  onSaved: (product: MenuProduct, mode: "created" | "updated") => void;
};

const PIZZA_PRESET: SizeDraft[] = [
  { id: "p", label: "Pequena", detail: "25 cm · 4 fatias", price: "44.90" },
  { id: "m", label: "Média", detail: "30 cm · 8 fatias", price: "59.90" },
  { id: "g", label: "Grande", detail: "35 cm · 12 fatias", price: "74.90" },
];

const SINGLE_PRESET: SizeDraft[] = [
  { id: "u", label: "Porção única", detail: "Servida gelada", price: "14.90" },
];

const inputClass =
  "w-full rounded-2xl border border-ink/15 bg-mozzarella px-4 py-2.5 text-sm font-medium text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-tomato";

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink/55">{children}</span>
      {hint && <span className="text-[11px] text-ink/40">{hint}</span>}
    </span>
  );
}

export function ProductFormModal({ open, pin, categories, product, onClose, onSaved }: Props) {
  const editing = Boolean(product);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [addonScope, setAddonScope] = useState<"none" | "salgada" | "doce">("none");
  const [sizes, setSizes] = useState<SizeDraft[]>([]);
  const [tags, setTags] = useState("");
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setCategoryId(product.categoryId);
      setImageUrl(product.imageUrl ?? "");
      setAddonScope(
        product.addonScope === "salgada" || product.addonScope === "doce"
          ? product.addonScope
          : "none",
      );
      setSizes(
        product.sizes.map((size) => ({
          id: size.id,
          label: size.label,
          detail: size.detail,
          price: (size.priceCents / 100).toFixed(2).replace(".", ","),
        })),
      );
      setTags(product.tags.join(", "));
      setAvailable(product.available);
      setFeatured(product.featured);
    } else {
      setName("");
      setDescription("");
      setCategoryId(categories[0]?.id ?? "");
      setImageUrl("");
      setAddonScope("salgada");
      setSizes(PIZZA_PRESET);
      setTags("");
      setAvailable(true);
      setFeatured(false);
    }
  }, [open, product, categories]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const previewTotal = useMemo(() => {
    const prices = sizes
      .map((size) => Math.round(Number(size.price.replace(",", ".")) * 100))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (prices.length === 0) return null;
    return { from: Math.min(...prices), count: prices.length };
  }, [sizes]);

  if (!open) return null;

  const updateSize = (index: number, patch: Partial<SizeDraft>) =>
    setSizes((current) =>
      current.map((size, position) => (position === index ? { ...size, ...patch } : size)),
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);

    const payload = {
      name,
      description,
      categoryId,
      imageUrl: imageUrl.trim(),
      addonScope: addonScope === "none" ? null : addonScope,
      sizes: sizes.map((size) => ({
        id: size.id,
        label: size.label,
        detail: size.detail,
        priceCents: Math.round(Number(size.price.replace(",", ".")) * 100),
      })),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      available,
      featured,
    };

    try {
      const response = await fetch(
        product
          ? `/api/admin/products/${product.id}?pin=${encodeURIComponent(pin)}`
          : `/api/admin/products?pin=${encodeURIComponent(pin)}`,
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as { ok: boolean; product?: MenuProduct; error?: string };
      if (!data.ok || !data.product) {
        setError(data.error ?? "Não foi possível salvar o item.");
        setSaving(false);
        return;
      }
      onSaved(data.product, product ? "updated" : "created");
    } catch {
      setError("Falha de conexão ao salvar.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
      />

      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        className="animate-pop-in relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[32px] bg-cream shadow-[0_40px_100px_rgba(0,0,0,0.5)] sm:rounded-[32px]"
      >
        <header className="flex items-center justify-between gap-4 border-b border-ink/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-tomato text-cream">
              <PizzaIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold leading-none">
                {editing ? "Editar item" : "Novo item do cardápio"}
              </h2>
              <p className="mt-1.5 text-xs text-ink/55">
                {editing
                  ? "As alterações aparecem na loja imediatamente."
                  : "Preencha os dados e o item entra no cardápio na hora."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-sand"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <Label hint={`${name.length}/80`}>Nome do item</Label>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Burrata & Tomate Confit"
                    required
                  />
                </label>

                <label className="block sm:col-span-2">
                  <Label hint="aparece no card e no modal">Descrição</Label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Ingredientes, finalização, harmonização…"
                  />
                </label>

                <label className="block">
                  <Label>Categoria</Label>
                  <select
                    className={inputClass}
                    value={categoryId}
                    onChange={(event) => setCategoryId(Number(event.target.value))}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <Label hint="opcional">URL da foto</Label>
                  <input
                    className={inputClass}
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://…"
                    inputMode="url"
                  />
                </label>
              </div>

              <div>
                <Label>Adicionais permitidos</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: "none", label: "Nenhum (bebidas)" },
                      { value: "salgada", label: "Grupo salgados" },
                      { value: "doce", label: "Grupo doces" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAddonScope(option.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                        addonScope === option.value
                          ? "border-basil bg-basil/12 text-basil"
                          : "border-ink/15 bg-mozzarella text-ink/65 hover:border-ink/35"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tamanhos e preços</Label>
                <div className="space-y-2">
                  {sizes.map((size, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_1.4fr_auto_auto] items-center gap-2 rounded-2xl border border-ink/12 bg-mozzarella p-2"
                    >
                      <input
                        className="w-full rounded-xl border border-ink/12 bg-cream px-3 py-2 text-sm font-semibold outline-none focus:border-tomato"
                        value={size.label}
                        onChange={(event) => updateSize(index, { label: event.target.value })}
                        placeholder="Média"
                        aria-label="Nome do tamanho"
                      />
                      <input
                        className="w-full rounded-xl border border-ink/12 bg-cream px-3 py-2 text-xs outline-none focus:border-tomato"
                        value={size.detail}
                        onChange={(event) => updateSize(index, { detail: event.target.value })}
                        placeholder="30 cm · 8 fatias"
                        aria-label="Detalhe do tamanho"
                      />
                      <span className="relative block">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/40">
                          R$
                        </span>
                        <input
                          className="w-24 rounded-xl border border-ink/12 bg-cream py-2 pl-8 pr-2 text-sm font-bold outline-none focus:border-tomato"
                          value={size.price}
                          onChange={(event) =>
                            updateSize(index, {
                              price: event.target.value.replace(/[^\d.,]/g, "").slice(0, 9),
                            })
                          }
                          inputMode="decimal"
                          aria-label="Preço"
                        />
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSizes((current) => current.filter((_, position) => position !== index))
                        }
                        disabled={sizes.length <= 1}
                        aria-label="Remover tamanho"
                        className="grid size-9 place-items-center rounded-xl text-ink/35 transition-colors hover:bg-tomato/12 hover:text-tomato disabled:opacity-30"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSizes((current) =>
                        current.length >= 4
                          ? current
                          : [...current, { id: "", label: "", detail: "", price: "" }],
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-bold text-ink/70 transition-colors hover:border-tomato hover:text-tomato"
                  >
                    <PlusIcon className="size-3.5" strokeWidth={2.4} />
                    adicionar tamanho
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizes(PIZZA_PRESET)}
                    className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold text-ink/70 transition-colors hover:border-tomato hover:text-tomato"
                  >
                    modelo pizza P/M/G
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizes(SINGLE_PRESET)}
                    className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold text-ink/70 transition-colors hover:border-tomato hover:text-tomato"
                  >
                    modelo porção única
                  </button>
                </div>
              </div>

              <label className="block">
                <Label hint="separadas por vírgula, máx. 5">Etiquetas</Label>
                <input
                  className={inputClass}
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="vegetariana, novidade, chef"
                />
              </label>
            </div>

            {/* Pré-visualização */}
            <aside className="lg:sticky lg:top-0 lg:self-start">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">
                pré-visualização
              </p>
              <article className="mt-3 overflow-hidden rounded-[26px] border border-ink/10 bg-mozzarella">
                <div className="aspect-[4/3] overflow-hidden bg-sand">
                  {imageUrl.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl.trim()}
                      alt=""
                      className="size-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.opacity = "0.15";
                      }}
                    />
                  ) : (
                    <div className="bg-checker grid size-full place-items-center text-ink/25">
                      <PizzaIcon className="size-12" strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-tomato"
                        >
                          {tag}
                        </span>
                      ))}
                    {featured && (
                      <span className="flex items-center gap-1 rounded-full bg-crust px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
                        <SparkIcon className="size-3" />
                        destaque
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-tight">
                    {name.trim() || "Nome do item"}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink/60">
                    {description.trim() || "A descrição aparecerá aqui, em até duas linhas."}
                  </p>
                  <p className="mt-3 font-display text-xl font-semibold">
                    {previewTotal ? formatBRL(previewTotal.from) : "R$ 0,00"}
                    {previewTotal && (
                      <span className="ml-2 text-[11px] font-sans font-semibold uppercase tracking-wide text-ink/45">
                        {previewTotal.count} {previewTotal.count === 1 ? "tamanho" : "tamanhos"}
                      </span>
                    )}
                  </p>
                </div>
              </article>

              <div className="mt-4 space-y-2">
                {(
                  [
                    {
                      checked: available,
                      set: setAvailable,
                      label: "Disponível para pedido",
                    },
                    { checked: featured, set: setFeatured, label: "Destacar na vitrine" },
                  ] as const
                ).map((toggle) => (
                  <button
                    key={toggle.label}
                    type="button"
                    onClick={() => toggle.set(!toggle.checked)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-ink/12 bg-mozzarella px-4 py-3 text-sm font-semibold transition-colors hover:border-ink/30"
                  >
                    {toggle.label}
                    <span
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        toggle.checked ? "bg-basil" : "bg-ink/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 grid size-5 place-items-center rounded-full bg-cream transition-all ${
                          toggle.checked ? "left-[22px]" : "left-0.5"
                        }`}
                      >
                        {toggle.checked && <CheckIcon className="size-3 text-basil" strokeWidth={3} />}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-cream px-6 py-4">
          <p className="text-xs text-ink/50">
            {error ? (
              <span className="font-semibold text-tomato">{error}</span>
            ) : (
              "Preços em reais. O slug é gerado automaticamente a partir do nome."
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink/15 px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-sand"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || categoryId === "" || sizes.length === 0}
              className="rounded-full bg-tomato px-6 py-3 text-sm font-bold text-cream transition-colors hover:bg-tomato-dark disabled:cursor-not-allowed disabled:bg-ink/25"
            >
              {saving ? "Salvando…" : editing ? "Salvar alterações" : "Publicar item"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
