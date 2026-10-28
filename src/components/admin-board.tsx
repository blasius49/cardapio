"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/header";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  NoteIcon,
  PizzaIcon,
  PlusIcon,
  ScooterIcon,
  SlidersIcon,
  SparkIcon,
  StoreIcon,
  TrashIcon,
} from "@/components/icons";
import { ProductFormModal } from "@/components/product-form-modal";
import type { Order, OrderItem, ProductSize } from "@/db/schema";
import type { MenuPayload, MenuProduct } from "@/lib/types";
import {
  formatBRL,
  formatDateTime,
  formatTime,
  PAYMENT_LABEL,
  STATUS_FLOW,
  STATUS_LABEL,
  type OrderStatus,
} from "@/lib/store";

const SESSION_KEY = "fornodoro:admin-pin";

type OrderWithItems = { order: Order; items: OrderItem[] };

const TABS = [
  { id: "orders", label: "Pedidos", icon: ScooterIcon },
  { id: "menu", label: "Cardápio", icon: SlidersIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminBoard() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("orders");

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [menu, setMenu] = useState<MenuPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [draftPrices, setDraftPrices] = useState<Record<number, Record<string, string>>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuProduct | null>(null);

  const loadOrders = useCallback(async (currentPin: string) => {
    const response = await fetch(`/api/admin/orders?pin=${encodeURIComponent(currentPin)}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as { ok: boolean; orders?: OrderWithItems[]; error?: string };
    if (!data.ok) throw new Error(data.error ?? "Sem permissão");
    setOrders(data.orders ?? []);
    setLastSync(new Date());
  }, []);

  const loadMenu = useCallback(async () => {
    const response = await fetch("/api/menu", { cache: "no-store" });
    const data = (await response.json()) as MenuPayload & { ok: boolean };
    setMenu({
      categories: data.categories,
      products: data.products,
      addons: data.addons,
    });
    const drafts: Record<number, Record<string, string>> = {};
    for (const product of data.products) {
      drafts[product.id] = Object.fromEntries(
        product.sizes.map((size) => [size.id, (size.priceCents / 100).toFixed(2)]),
      );
    }
    setDraftPrices(drafts);
  }, []);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setAuthed(stored);
      setLoading(true);
      Promise.all([loadOrders(stored), loadMenu()])
        .catch(() => {
          window.sessionStorage.removeItem(SESSION_KEY);
          setAuthed(null);
          setAuthError("Sessão expirada. Digite o PIN novamente.");
        })
        .finally(() => setLoading(false));
    }
  }, [loadOrders, loadMenu]);

  useEffect(() => {
    if (!authed) return;
    const timer = window.setInterval(() => {
      loadOrders(authed).catch(() => undefined);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [authed, loadOrders]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      await loadOrders(pin);
      await loadMenu();
      window.sessionStorage.setItem(SESSION_KEY, pin);
      setAuthed(pin);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "PIN incorreto.");
    } finally {
      setLoading(false);
    }
  };

  const advance = async (entry: OrderWithItems) => {
    if (!authed) return;
    const current = entry.order.status as OrderStatus;
    const index = STATUS_FLOW.indexOf(current);
    const next = STATUS_FLOW[Math.min(index + 1, STATUS_FLOW.length - 1)];
    if (next === current) return;
    await patchStatus(entry.order.id, next);
  };

  const patchStatus = async (orderId: number, status: OrderStatus) => {
    if (!authed) return;
    const response = await fetch(`/api/admin/orders/${orderId}?pin=${encodeURIComponent(authed)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await response.json()) as { ok: boolean; order?: Order; error?: string };
    if (data.ok && data.order) {
      setOrders((current) =>
        current.map((entry) =>
          entry.order.id === data.order!.id ? { ...entry, order: data.order! } : entry,
        ),
      );
      setFeedback(`${data.order.code} → ${STATUS_LABEL[status]}`);
      window.setTimeout(() => setFeedback(null), 2400);
    } else {
      setFeedback(data.error ?? "Falha ao atualizar");
      window.setTimeout(() => setFeedback(null), 3000);
    }
  };

  const saveProduct = async (productId: number) => {
    if (!authed || !menu) return;
    const product = menu.products.find((entry) => entry.id === productId);
    if (!product) return;
    const draft = draftPrices[productId] ?? {};
    const sizes: ProductSize[] = product.sizes.map((size) => {
      const raw = Number(String(draft[size.id] ?? "").replace(",", "."));
      const priceCents = Number.isFinite(raw) && raw > 0 ? Math.round(raw * 100) : size.priceCents;
      return { ...size, priceCents };
    });
    const response = await fetch(`/api/admin/products/${productId}?pin=${encodeURIComponent(authed)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sizes }),
    });
    const data = (await response.json()) as { ok: boolean; product?: { sizes: ProductSize[] } };
    if (data.ok && data.product) {
      setMenu((current) =>
        current
          ? {
              ...current,
              products: current.products.map((entry) =>
                entry.id === productId ? { ...entry, sizes: data.product!.sizes } : entry,
              ),
            }
          : current,
      );
      setDraftPrices((current) => ({
        ...current,
        [productId]: Object.fromEntries(
          data.product!.sizes.map((size) => [size.id, (size.priceCents / 100).toFixed(2)]),
        ),
      }));
      setFeedback("Preços atualizados");
      window.setTimeout(() => setFeedback(null), 2200);
    }
  };

  const toggleAvailable = async (productId: number, available: boolean, featured?: boolean) => {
    if (!authed || !menu) return;
    const body: Record<string, boolean> = {};
    if (typeof available === "boolean") body.available = available;
    if (typeof featured === "boolean") body.featured = featured;
    const response = await fetch(`/api/admin/products/${productId}?pin=${encodeURIComponent(authed)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as {
      ok: boolean;
      product?: { available: boolean; featured: boolean };
    };
    if (data.ok && data.product) {
      setMenu((current) =>
        current
          ? {
              ...current,
              products: current.products.map((entry) =>
                entry.id === productId ? { ...entry, ...data.product } : entry,
              ),
            }
          : current,
      );
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: MenuProduct) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleSaved = (saved: MenuProduct, mode: "created" | "updated") => {
    setMenu((current) => {
      if (!current) return current;
      const exists = current.products.some((entry) => entry.id === saved.id);
      return {
        ...current,
        products: exists
          ? current.products.map((entry) => (entry.id === saved.id ? saved : entry))
          : [...current.products, saved],
      };
    });
    setDraftPrices((current) => ({
      ...current,
      [saved.id]: Object.fromEntries(
        saved.sizes.map((size) => [size.id, (size.priceCents / 100).toFixed(2)]),
      ),
    }));
    setFormOpen(false);
    setEditing(null);
    setFeedback(
      mode === "created" ? `${saved.name} publicado no cardápio` : `${saved.name} atualizado`,
    );
    window.setTimeout(() => setFeedback(null), 2600);
  };

  const removeProduct = async (product: MenuProduct) => {
    if (!authed) return;
    const confirmed = window.confirm(
      `Remover "${product.name}" do cardápio? Pedidos já registrados continuam intactos.`,
    );
    if (!confirmed) return;
    const response = await fetch(
      `/api/admin/products/${product.id}?pin=${encodeURIComponent(authed)}`,
      { method: "DELETE" },
    );
    const data = (await response.json()) as { ok: boolean; error?: string };
    if (data.ok) {
      setMenu((current) =>
        current
          ? { ...current, products: current.products.filter((entry) => entry.id !== product.id) }
          : current,
      );
      setFeedback(`${product.name} removido do cardápio`);
      window.setTimeout(() => setFeedback(null), 2600);
    } else {
      setFeedback(data.error ?? "Falha ao remover");
      window.setTimeout(() => setFeedback(null), 3000);
    }
  };

  const stats = useMemo(() => {
    const valid = orders.filter((entry) => entry.order.status !== "cancelled");
    const revenue = valid.reduce((sum, entry) => sum + entry.order.totalCents, 0);
    const open = valid.filter(
      (entry) => entry.order.status !== "completed",
    ).length;
    return {
      total: orders.length,
      open,
      revenue,
      ticket: valid.length ? Math.round(revenue / valid.length) : 0,
    };
  }, [orders]);

  const visibleOrders = useMemo(
    () =>
      filter === "all" ? orders : orders.filter((entry) => entry.order.status === filter),
    [orders, filter],
  );

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-4 py-16 text-cream">
        <form
          onSubmit={signIn}
          className="animate-pop-in w-full max-w-sm rounded-[28px] border border-cream/15 bg-cream/[0.06] p-8 backdrop-blur"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-tomato text-cream">
            <SlidersIcon className="size-7" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold">Painel da pizzaria</h1>
          <p className="mt-2 text-sm text-cream/60">
            Área restrita da equipe: acompanhe pedidos e ajuste o cardápio.
          </p>
          <label className="mt-6 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cream/50">PIN</span>
            <input
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="••••"
              autoFocus
              className="mt-2 w-full rounded-2xl border border-cream/20 bg-ink/50 px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-crust"
            />
          </label>
          {authError && (
            <p className="mt-3 rounded-xl bg-tomato/25 px-3 py-2 text-sm font-semibold">{authError}</p>
          )}
          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="mt-6 w-full rounded-full bg-crust px-6 py-3.5 text-sm font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Verificando…" : "Entrar no painel"}
          </button>
          <p className="mt-4 text-center text-xs text-cream/45">
            Demonstração: PIN <span className="font-mono text-crust">1234</span>
          </p>
          <Link
            href="/"
            className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-cream/50 hover:text-cream"
          >
            ← voltar ao cardápio
          </Link>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="border-b border-ink/10 bg-mozzarella">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-ink/15 px-4 py-2 text-sm font-bold text-ink hover:border-tomato hover:text-tomato"
            >
              Ver loja
            </Link>
            <button
              type="button"
              onClick={() => {
                window.sessionStorage.removeItem(SESSION_KEY);
                setAuthed(null);
                setOrders([]);
              }}
              className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream hover:bg-tomato"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-none">Painel operacional</h1>
            <p className="mt-2 text-sm text-ink/60">
              Atualização automática a cada 12 segundos
              {lastSync ? ` · sincronizado às ${formatTime(lastSync)}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {TABS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${
                  tab === entry.id
                    ? "bg-ink text-cream shadow-[0_10px_24px_rgba(28,18,16,0.25)]"
                    : "bg-mozzarella text-ink-soft border border-ink/12 hover:border-ink/30"
                }`}
              >
                <entry.icon className="size-4.5" />
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <p className="animate-pop-in mt-5 inline-flex items-center gap-2 rounded-full bg-basil px-4 py-2 text-sm font-bold text-cream">
            <CheckIcon className="size-4" />
            {feedback}
          </p>
        )}

        {tab === "orders" ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Pedidos", value: String(stats.total), icon: PizzaIcon },
                { label: "Em andamento", value: String(stats.open), icon: ClockIcon },
                { label: "Faturamento", value: formatBRL(stats.revenue), icon: SparkIcon },
                { label: "Ticket médio", value: formatBRL(stats.ticket), icon: StoreIcon },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-ink/10 bg-mozzarella p-5"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-sand text-tomato">
                    <card.icon className="size-5" />
                  </span>
                  <p className="mt-4 font-display text-3xl font-semibold">{card.value}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
              {(["all", ...STATUS_FLOW, "cancelled"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status as OrderStatus | "all")}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    filter === status ? "bg-tomato text-cream" : "bg-mozzarella text-ink/65 border border-ink/12"
                  }`}
                >
                  {status === "all" ? "Todos" : STATUS_LABEL[status as OrderStatus]}
                  <span className="ml-2 text-xs opacity-70">
                    {status === "all"
                      ? orders.length
                      : orders.filter((entry) => entry.order.status === status).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {visibleOrders.length === 0 && (
                <p className="rounded-3xl border border-dashed border-ink/20 bg-mozzarella p-10 text-center text-ink/55">
                  Nenhum pedido neste filtro.
                </p>
              )}

              {visibleOrders.map(({ order, items }) => {
                const status = order.status as OrderStatus;
                const isLast = status === "completed" || status === "cancelled";
                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-ink/10 bg-mozzarella"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-lg font-semibold">{order.code}</span>
                        <span className="text-sm text-ink/60">{formatDateTime(order.createdAt)}</span>
                        <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink/65">
                          {order.fulfillment === "pickup" ? "retirada" : "entrega"}
                        </span>
                        <span className="rounded-full bg-ink/8 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink/65">
                          {PAYMENT_LABEL[order.paymentMethod]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                            status === "cancelled"
                              ? "bg-tomato/15 text-tomato"
                              : status === "completed"
                                ? "bg-basil/15 text-basil"
                                : "bg-crust/30 text-ink"
                          }`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                        <span className="font-display text-xl font-semibold">
                          {formatBRL(order.totalCents)}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-5 px-5 py-4 lg:grid-cols-[1.2fr_1fr]">
                      <div>
                        <p className="text-sm font-bold text-ink">{order.customerName}</p>
                        <p className="text-sm text-ink/60">{order.phone}</p>
                        {order.fulfillment === "delivery" ? (
                          <p className="mt-1 text-sm text-ink/60">
                            {order.street}, {order.houseNumber}
                            {order.complement ? ` — ${order.complement}` : ""} · {order.district}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-ink/60">Retirada no balcão</p>
                        )}
                        {order.notes && (
                          <p className="mt-2 rounded-xl bg-sand/70 px-3 py-2 text-sm italic text-ink/65">
                            “{order.notes}”
                          </p>
                        )}
                        {order.cashChangeForCents ? (
                          <p className="mt-2 text-xs font-semibold text-tomato">
                            Troco para {formatBRL(order.cashChangeForCents)}
                          </p>
                        ) : null}
                      </div>

                      <ul className="space-y-1.5 text-sm">
                        {items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-3">
                            <span className="text-ink/75">
                              <strong className="text-tomato">{item.quantity}×</strong>{" "}
                              {item.productName}{" "}
                              <span className="text-ink/45">({item.sizeLabel})</span>
                              {item.selectedAddons.length > 0 && (
                                <span className="text-basil">
                                  {" "}
                                  +{item.selectedAddons.map((addon) => addon.name).join(", ")}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 font-semibold">
                              {formatBRL(item.totalCents)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 bg-cream/60 px-5 py-3">
                      {!isLast && (
                        <button
                          type="button"
                          onClick={() => advance({ order, items })}
                          className="group inline-flex items-center gap-2 rounded-full bg-tomato px-5 py-2.5 text-sm font-bold text-cream hover:bg-tomato-dark"
                        >
                          Avançar para {STATUS_LABEL[STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1]] ?? "concluído"}
                          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      )}
                      <Link
                        href={`/pedido/${order.code}`}
                        className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink hover:border-tomato hover:text-tomato"
                      >
                        Ver rastreio
                      </Link>
                      {status !== "cancelled" && status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => patchStatus(order.id, "cancelled")}
                          className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-ink/50 hover:text-tomato"
                        >
                          <TrashIcon className="size-4" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-mozzarella">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Cardápio{" "}
                  <span className="text-base font-medium text-ink/45">
                    ({menu?.products.length ?? 0} itens)
                  </span>
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Cadastre novidades, marque itens esgotados, destaque sabores e ajuste preços —
                  tudo reflete na loja na hora.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-full bg-tomato px-5 py-3 text-sm font-bold text-cream shadow-[0_12px_26px_rgba(200,52,29,0.28)] transition-colors hover:bg-tomato-dark"
              >
                <PlusIcon className="size-4.5" strokeWidth={2.2} />
                Novo item do cardápio
              </button>
            </div>

            <ul className="divide-y divide-ink/10">
              {menu?.products.map((product) => {
                const category = menu.categories.find((entry) => entry.id === product.categoryId);
                return (
                  <li key={product.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="size-14 shrink-0 overflow-hidden rounded-2xl bg-sand">
                      {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={`size-full object-cover ${product.available ? "" : "grayscale"}`}
                        />
                      )}
                    </div>

                    <div className="min-w-40 flex-1">
                      <p className="font-display text-lg font-semibold leading-tight">
                        {product.name}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                        {category?.name}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {product.sizes.map((size) => (
                        <label key={size.id} className="flex items-center gap-1.5">
                          <span className="text-xs font-bold uppercase text-ink/45">
                            {size.label.slice(0, 1)}
                          </span>
                          <input
                            value={draftPrices[product.id]?.[size.id] ?? ""}
                            onChange={(event) =>
                              setDraftPrices((current) => ({
                                ...current,
                                [product.id]: {
                                  ...(current[product.id] ?? {}),
                                  [size.id]: event.target.value,
                                },
                              }))
                            }
                            inputMode="decimal"
                            className="w-20 rounded-lg border border-ink/15 bg-cream px-2 py-1.5 text-sm font-semibold outline-none focus:border-tomato"
                          />
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={() => saveProduct(product.id)}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-cream hover:bg-tomato"
                      >
                        salvar preços
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAvailable(product.id, !product.available)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                          product.available
                            ? "bg-basil/15 text-basil hover:bg-basil/25"
                            : "bg-tomato/15 text-tomato hover:bg-tomato/25"
                        }`}
                      >
                        {product.available ? (
                          <>
                            <CheckIcon className="size-3.5" /> disponível
                          </>
                        ) : (
                          <>
                            <CloseIcon className="size-3.5" /> esgotado
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAvailable(product.id, product.available, !product.featured)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                          product.featured
                            ? "bg-crust/30 text-ink hover:bg-crust/45"
                            : "bg-ink/8 text-ink/50 hover:bg-ink/15"
                        }`}
                      >
                        <SparkIcon className="size-3.5" />
                        {product.featured ? "destaque" : "destacar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        aria-label={`Editar ${product.name}`}
                        title="Editar item"
                        className="grid size-9 place-items-center rounded-full border border-ink/12 text-ink/55 transition-colors hover:border-tomato hover:text-tomato"
                      >
                        <NoteIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(product)}
                        aria-label={`Remover ${product.name}`}
                        title="Remover item"
                        className="grid size-9 place-items-center rounded-full border border-ink/12 text-ink/40 transition-colors hover:border-tomato hover:bg-tomato/10 hover:text-tomato"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {!menu && (
              <p className="px-5 py-12 text-center text-sm text-ink/50">
                Carregando cardápio…
              </p>
            )}
          </div>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        pin={authed}
        categories={menu?.categories ?? []}
        product={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />
    </main>
  );
}
