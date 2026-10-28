"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  CardIcon,
  CashIcon,
  CheckIcon,
  ChefIcon,
  ClockIcon,
  FlameIcon,
  NoteIcon,
  PhoneIcon,
  PinIcon,
  PizzaIcon,
  ScooterIcon,
  SparkIcon,
  StoreIcon,
  WhatsappIcon,
} from "@/components/icons";
import type { Order, OrderItem } from "@/db/schema";
import {
  formatBRL,
  formatDateTime,
  formatTime,
  PAYMENT_LABEL,
  STATUS_FLOW,
  STATUS_HINT,
  STATUS_LABEL,
  STORE,
  type OrderStatus,
} from "@/lib/store";

const STEP_ICONS: Record<OrderStatus, typeof ChefIcon> = {
  received: CheckIcon,
  preparing: ChefIcon,
  oven: FlameIcon,
  delivering: ScooterIcon,
  completed: StoreIcon,
  cancelled: NoteIcon,
};

type Props = {
  initialOrder: Order;
  initialItems: OrderItem[];
  isNew: boolean;
};

export function OrderTracker({ initialOrder, initialItems, isNew }: Props) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState(false);

  const active = order.status !== "completed" && order.status !== "cancelled";

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const response = await fetch(`/api/orders/${order.code}`, { cache: "no-store" });
        const data = (await response.json()) as { ok: boolean; order?: Order; items?: OrderItem[] };
        if (!cancelled && data.ok && data.order) {
          setOrder(data.order);
          setItems(data.items ?? []);
          setLive(true);
        }
      } catch {
        /* segue o jogo: tentamos de novo no próximo tick */
      }
    };
    const timer = window.setInterval(tick, 7000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [active, order.code]);

  const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
  const isPickup = order.fulfillment === "pickup";

  const eta = new Date(order.createdAt);
  eta.setMinutes(eta.getMinutes() + (isPickup ? 25 : STORE.etaMinutes));

  const labelFor = (status: OrderStatus) => {
    if (!isPickup) return STATUS_LABEL[status];
    if (status === "delivering") return "Pronta para retirada";
    if (status === "completed") return "Retirada no balcão";
    return STATUS_LABEL[status];
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const PaymentIcon =
    order.paymentMethod === "pix" ? SparkIcon : order.paymentMethod === "card" ? CardIcon : CashIcon;

  return (
    <main className="bg-paper min-h-screen pb-20">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {isNew && (
          <div className="animate-pop-in mb-8 overflow-hidden rounded-[28px] bg-basil px-7 py-6 text-cream shadow-[0_24px_50px_rgba(47,107,58,0.3)]">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cream/75">
              <PizzaIcon className="size-4" />
              pedido confirmado
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Grazie, {order.customerName.split(" ")[0]}! Já acendemos o forno.
            </h1>
            <p className="mt-2 text-sm text-cream/80">
              Guarde o código abaixo para acompanhar cada etapa do preparo.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          {/* Status */}
          <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/50">pedido</p>
                <button
                  type="button"
                  onClick={copyCode}
                  className="group mt-1 flex items-center gap-2 font-mono text-3xl font-semibold tracking-tight text-ink"
                  title="Copiar código"
                >
                  {order.code}
                  <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {copied ? "copiado!" : "copiar"}
                  </span>
                </button>
                <p className="mt-1 text-sm text-ink/55">
                  {formatDateTime(order.createdAt)}
                  {live && <span className="ml-2 text-basil">· ao vivo</span>}
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  order.status === "cancelled"
                    ? "bg-tomato/15 text-tomato"
                    : order.status === "completed"
                      ? "bg-basil/15 text-basil"
                      : "bg-crust/25 text-ink"
                }`}
              >
                {labelFor(order.status as OrderStatus)}
              </span>
            </div>

            {order.status !== "cancelled" && (
              <p className="mt-5 flex items-center gap-2 rounded-2xl bg-sand/70 px-4 py-3 text-sm font-semibold text-ink/75">
                <ClockIcon className="size-5 text-tomato" />
                {order.status === "completed"
                  ? `Concluído às ${formatTime(order.statusUpdatedAt)}`
                  : `Previsão de ${isPickup ? "retirada" : "entrega"}: ${formatTime(eta)}`}
              </p>
            )}

            <ol className="mt-7 space-y-1">
              {STATUS_FLOW.map((status, index) => {
                const done = order.status === "cancelled" ? false : index < currentIndex;
                const current = order.status === status;
                const Icon = STEP_ICONS[status];
                return (
                  <li key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid size-11 place-items-center rounded-full border-2 transition-all ${
                          current
                            ? "border-tomato bg-tomato text-cream shadow-[0_10px_24px_rgba(200,52,29,0.35)]"
                            : done
                              ? "border-basil bg-basil text-cream"
                              : "border-ink/15 bg-cream text-ink/35"
                        }`}
                      >
                        <Icon className={current ? "size-5 animate-flame" : "size-5"} />
                      </span>
                      {index < STATUS_FLOW.length - 1 && (
                        <span
                          className={`w-0.5 flex-1 rounded ${done ? "bg-basil" : "bg-ink/10"}`}
                          style={{ minHeight: 34 }}
                        />
                      )}
                    </div>
                    <div className="pb-6">
                      <p
                        className={`font-display text-lg font-semibold leading-tight ${
                          current ? "text-tomato" : done ? "text-ink" : "text-ink/40"
                        }`}
                      >
                        {labelFor(status as OrderStatus)}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink/55">
                        {STATUS_HINT[status]}
                      </p>
                      {current && (
                        <p className="mt-1 text-xs font-semibold text-basil">
                          atualizado às {formatTime(order.statusUpdatedAt)}
                        </p>
                      )}
                      {index === 0 && !current && (
                        <p className="mt-1 text-xs font-semibold text-basil">
                          {formatDateTime(order.createdAt)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {order.status === "cancelled" && (
              <p className="mt-4 rounded-2xl bg-tomato/12 px-4 py-3 text-sm font-semibold text-tomato">
                {STATUS_HINT.cancelled}
              </p>
            )}
          </section>

          {/* Detalhes */}
          <div className="space-y-6">
            <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-7">
              <h2 className="font-display text-2xl font-semibold">Itens do pedido</h2>
              <ul className="mt-5 divide-y divide-ink/10">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-sand">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold leading-tight">
                        <span className="text-tomato">{item.quantity}×</span> {item.productName}
                      </p>
                      <p className="text-xs font-semibold text-ink/55">
                        {item.sizeLabel} · {formatBRL(item.unitPriceCents)} / un
                      </p>
                      {item.selectedAddons.length > 0 && (
                        <p className="mt-1 text-xs text-basil">
                          + {item.selectedAddons.map((addon) => addon.name).join(", ")}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-1 text-xs italic text-ink/50">“{item.notes}”</p>
                      )}
                    </div>
                    <span className="font-display text-lg font-semibold">
                      {formatBRL(item.totalCents)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-2 border-t border-ink/10 pt-5 text-sm">
                <div className="flex justify-between text-ink/65">
                  <dt>Subtotal</dt>
                  <dd>{formatBRL(order.subtotalCents)}</dd>
                </div>
                {order.discountCents > 0 && (
                  <div className="flex justify-between text-basil">
                    <dt>Desconto {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                    <dd>−{formatBRL(order.discountCents)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-ink/65">
                  <dt>{isPickup ? "Retirada" : "Taxa de entrega"}</dt>
                  <dd>
                    {order.deliveryFeeCents === 0 && !isPickup
                      ? "Grátis"
                      : formatBRL(order.deliveryFeeCents)}
                  </dd>
                </div>
                <div className="flex items-end justify-between border-t border-ink/10 pt-3">
                  <dt className="font-display text-lg">Total</dt>
                  <dd className="font-display text-3xl font-semibold text-tomato">
                    {formatBRL(order.totalCents)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-7">
              <h2 className="font-display text-2xl font-semibold">Dados da entrega</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink/70">
                <li className="flex items-start gap-3">
                  <PhoneIcon className="mt-0.5 size-4.5 shrink-0 text-tomato" />
                  <span>
                    <strong className="text-ink">{order.customerName}</strong>
                    <br />
                    {order.phone}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  {isPickup ? (
                    <StoreIcon className="mt-0.5 size-4.5 shrink-0 text-tomato" />
                  ) : (
                    <PinIcon className="mt-0.5 size-4.5 shrink-0 text-tomato" />
                  )}
                  <span>
                    {isPickup ? (
                      <>
                        Retirada em <strong className="text-ink">{STORE.address}</strong>
                      </>
                    ) : (
                      <>
                        {order.street}, {order.houseNumber}
                        {order.complement ? ` — ${order.complement}` : ""}
                        <br />
                        {order.district}
                        {order.reference && (
                          <>
                            <br />
                            <span className="text-ink/55">Ref.: {order.reference}</span>
                          </>
                        )}
                      </>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <PaymentIcon className="mt-0.5 size-4.5 shrink-0 text-tomato" />
                  <span>
                    {PAYMENT_LABEL[order.paymentMethod]}
                    {order.cashChangeForCents
                      ? ` · troco para ${formatBRL(order.cashChangeForCents)}`
                      : ""}
                  </span>
                </li>
                {order.notes && (
                  <li className="flex items-start gap-3">
                    <NoteIcon className="mt-0.5 size-4.5 shrink-0 text-tomato" />
                    <span className="italic">“{order.notes}”</span>
                  </li>
                )}
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-cream transition-colors hover:bg-tomato"
                >
                  Pedir de novo
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
                    `Olá! Meu pedido é o ${order.code}.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:border-basil hover:text-basil"
                >
                  <WhatsappIcon className="size-4.5" />
                  Falar com a pizzaria
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
