"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import {
  ArrowRightIcon,
  CardIcon,
  CashIcon,
  CheckIcon,
  MinusIcon,
  NoteIcon,
  PhoneIcon,
  PinIcon,
  PixIcon,
  PlusIcon,
  ScooterIcon,
  StoreIcon,
  TrashIcon,
} from "@/components/icons";
import { formatBRL, maskPhone, STORE } from "@/lib/store";

type Fulfillment = "delivery" | "pickup";
type Payment = "pix" | "card" | "cash";

const PAYMENTS: { value: Payment; label: string; hint: string; icon: typeof PixIcon }[] = [
  { value: "pix", label: "PIX", hint: "aprovação na hora", icon: PixIcon },
  { value: "card", label: "Cartão", hint: "crédito ou débito na entrega", icon: CardIcon },
  { value: "cash", label: "Dinheiro", hint: "informe o troco", icon: CashIcon },
];

function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-xs font-bold uppercase tracking-[0.14em] text-ink/55">
        {label}
        {required && <span className="text-tomato">obrigatório</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-ink/15 bg-mozzarella px-4 py-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-tomato";

export function CheckoutForm() {
  const router = useRouter();
  const { items, setQuantity, removeItem, subtotalCents, clear, count, hydrated } = useCart();

  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [payment, setPayment] = useState<Payment>("pix");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [changeFor, setChangeFor] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    description: string;
    discountCents: number;
    freeDelivery: boolean;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFeeCents = useMemo(() => {
    if (fulfillment === "pickup") return 0;
    if (coupon?.freeDelivery) return 0;
    if (subtotalCents >= STORE.freeDeliveryFromCents) return 0;
    return STORE.deliveryFeeCents;
  }, [fulfillment, coupon, subtotalCents]);

  const discountCents = coupon?.freeDelivery ? 0 : (coupon?.discountCents ?? 0);
  const totalCents = Math.max(0, subtotalCents - discountCents + deliveryFeeCents);

  const applyCoupon = async () => {
    setCouponLoading(true);
    setCouponError(null);
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotalCents }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        code?: string;
        description?: string;
        discountCents?: number;
        freeDelivery?: boolean;
      };
      if (!data.ok) {
        setCoupon(null);
        setCouponError(data.error ?? "Não foi possível aplicar este cupom.");
        return;
      }
      setCoupon({
        code: data.code!,
        description: data.description ?? "",
        discountCents: data.discountCents ?? 0,
        freeDelivery: Boolean(data.freeDelivery),
      });
    } catch {
      setCouponError("Falha de conexão ao validar o cupom.");
    } finally {
      setCouponLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (items.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }
    if (fulfillment === "delivery" && subtotalCents < STORE.minOrderCents) {
      setError(`O pedido mínimo para entrega é ${formatBRL(STORE.minOrderCents)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const changeValue = Number(changeFor.replace(",", "."));
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            addonIds: item.addons.map((addon) => addon.id),
            notes: item.notes,
          })),
          customerName: name,
          phone,
          fulfillment,
          street,
          houseNumber,
          complement,
          district,
          reference,
          paymentMethod: payment,
          cashChangeForCents:
            payment === "cash" && Number.isFinite(changeValue) && changeValue > 0
              ? Math.round(changeValue * 100)
              : null,
          couponCode: coupon?.code ?? null,
          notes,
        }),
      });
      const data = (await response.json()) as { ok: boolean; code?: string; error?: string };
      if (!data.ok || !data.code) {
        setError(data.error ?? "Não foi possível enviar o pedido.");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/pedido/${data.code}?novo=1`);
    } catch {
      setError("Falha de conexão. Tente novamente em alguns segundos.");
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-ink/50">
        <p className="animate-pulse font-display text-xl">Carregando seu carrinho…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-4 py-16 text-center">
        <div>
          <span className="mx-auto grid size-24 place-items-center rounded-full bg-sand text-tomato">
            <StoreIcon className="size-12" strokeWidth={1.2} />
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold">Nada no carrinho ainda</h1>
          <p className="mt-3 text-ink/60">
            Escolha uma pizza no cardápio e volte aqui para finalizar em segundos.
          </p>
          <Link
            href="/#cardapio"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-tomato px-7 py-4 text-base font-bold text-cream transition-colors hover:bg-tomato-dark"
          >
            Ir para o cardápio
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="space-y-8">
        {/* Itens */}
        <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-6 sm:p-7">
          <h2 className="font-display text-2xl font-semibold">
            1. Confira seus itens{" "}
            <span className="text-base font-medium text-ink/50">({count})</span>
          </h2>
          <ul className="mt-5 divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-sand">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold leading-tight">{item.name}</p>
                  <p className="text-xs font-semibold text-ink/55">
                    {item.sizeLabel} · {formatBRL(item.unitPriceCents)} / un
                  </p>
                  {item.addons.length > 0 && (
                    <p className="mt-1 text-xs text-basil">
                      + {item.addons.map((addon) => addon.name).join(", ")}
                    </p>
                  )}
                  {item.notes && <p className="mt-1 text-xs italic text-ink/50">“{item.notes}”</p>}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-cream p-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.key, item.quantity - 1)}
                    className="grid size-7 place-items-center rounded-full hover:bg-sand"
                    aria-label="Diminuir"
                  >
                    <MinusIcon className="size-3.5" strokeWidth={2.4} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.key, item.quantity + 1)}
                    className="grid size-7 place-items-center rounded-full hover:bg-sand"
                    aria-label="Aumentar"
                  >
                    <PlusIcon className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
                <div className="w-24 text-right font-display text-lg font-semibold">
                  {formatBRL(item.unitPriceCents * item.quantity)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  aria-label={`Remover ${item.name}`}
                  className="text-ink/30 transition-colors hover:text-tomato"
                >
                  <TrashIcon className="size-4.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Contato */}
        <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-6 sm:p-7">
          <h2 className="font-display text-2xl font-semibold">2. Quem recebe o pedido?</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" required>
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Maria Antonieta"
                autoComplete="name"
              />
            </Field>
            <Field label="Celular / WhatsApp" required hint="Usamos apenas para falar do pedido.">
              <span className="relative block">
                <PhoneIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <input
                  className={`${inputClass} pl-11`}
                  value={phone}
                  onChange={(event) => setPhone(maskPhone(event.target.value))}
                  placeholder="(11) 98888-7777"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </span>
            </Field>
          </div>
        </section>

        {/* Entrega */}
        <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-6 sm:p-7">
          <h2 className="font-display text-2xl font-semibold">3. Entrega ou retirada</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "delivery",
                  title: "Entregar no endereço",
                  detail: `Taxa ${formatBRL(STORE.deliveryFeeCents)} · ~${STORE.etaMinutes} min`,
                  icon: ScooterIcon,
                },
                {
                  value: "pickup",
                  title: "Retirar na pizzaria",
                  detail: "Sem taxa · pronta em ~25 min",
                  icon: StoreIcon,
                },
              ] as const
            ).map((option) => {
              const activeOption = fulfillment === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFulfillment(option.value)}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    activeOption
                      ? "border-tomato bg-tomato/8"
                      : "border-ink/12 bg-cream hover:border-ink/30"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      activeOption ? "bg-tomato text-cream" : "bg-sand text-ink/60"
                    }`}
                  >
                    <option.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-bold">{option.title}</span>
                    <span className="mt-0.5 block text-xs text-ink/55">{option.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {fulfillment === "delivery" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Field label="Rua" required>
                  <input
                    className={inputClass}
                    value={street}
                    onChange={(event) => setStreet(event.target.value)}
                    placeholder="Rua Harmonia"
                    autoComplete="address-line1"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Número" required>
                  <input
                    className={inputClass}
                    value={houseNumber}
                    onChange={(event) => setHouseNumber(event.target.value)}
                    placeholder="233"
                  />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field label="Bairro" required>
                  <input
                    className={inputClass}
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    placeholder="Vila Madalena"
                  />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field label="Complemento">
                  <input
                    className={inputClass}
                    value={complement}
                    onChange={(event) => setComplement(event.target.value)}
                    placeholder="Apto 82, bloco B"
                  />
                </Field>
              </div>
              <div className="sm:col-span-6">
                <Field label="Ponto de referência">
                  <span className="relative block">
                    <PinIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                    <input
                      className={`${inputClass} pl-11`}
                      value={reference}
                      onChange={(event) => setReference(event.target.value)}
                      placeholder="Portão verde, interfone 82"
                    />
                  </span>
                </Field>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-basil/30 bg-basil/8 p-5">
              <p className="flex items-center gap-2 font-bold text-basil">
                <StoreIcon className="size-5" />
                Retirada no balcão
              </p>
              <p className="mt-2 text-sm text-ink/70">{STORE.address}</p>
              <p className="mt-1 text-sm text-ink/55">
                Avisaremos por WhatsApp assim que a pizza sair do forno.
              </p>
            </div>
          )}
        </section>

        {/* Pagamento */}
        <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-6 sm:p-7">
          <h2 className="font-display text-2xl font-semibold">4. Pagamento</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {PAYMENTS.map((option) => {
              const activePayment = payment === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPayment(option.value)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    activePayment
                      ? "border-basil bg-basil/10"
                      : "border-ink/12 bg-cream hover:border-ink/30"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <option.icon className="size-6 text-ink/70" />
                    <span
                      className={`grid size-5 place-items-center rounded-full border-2 ${
                        activePayment ? "border-basil bg-basil text-cream" : "border-ink/25"
                      }`}
                    >
                      {activePayment && <CheckIcon className="size-3" strokeWidth={3} />}
                    </span>
                  </span>
                  <span className="mt-3 block font-bold">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-ink/55">{option.hint}</span>
                </button>
              );
            })}
          </div>

          {payment === "cash" && (
            <div className="mt-4 sm:max-w-xs">
              <Field label="Troco para quanto?" hint="Deixe em branco se não precisar de troco.">
                <span className="relative block">
                  <CashIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                  <input
                    className={`${inputClass} pl-11`}
                    value={changeFor}
                    onChange={(event) =>
                      setChangeFor(event.target.value.replace(/[^\d.,]/g, "").slice(0, 10))
                    }
                    placeholder="100,00"
                    inputMode="decimal"
                  />
                </span>
              </Field>
            </div>
          )}

          {payment === "pix" && (
            <p className="mt-4 rounded-2xl bg-crust/20 px-4 py-3 text-sm text-ink/70">
              Assim que confirmar, você recebe o QR Code PIX no WhatsApp e na página de
              acompanhamento.
            </p>
          )}
        </section>

        {/* Observações */}
        <section className="rounded-[28px] border border-ink/10 bg-mozzarella p-6 sm:p-7">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <NoteIcon className="size-6 text-tomato" />
            5. Alguma observação?
          </h2>
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={300}
            placeholder="Ex.: entregar na portaria, não bater na porta, cortar em 16 pedaços…"
            className={`${inputClass} mt-4 resize-none`}
          />
        </section>
      </div>

      {/* Resumo */}
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="overflow-hidden rounded-[28px] border border-ink/10 bg-ink text-cream">
          <div className="border-b border-cream/12 px-6 py-5">
            <h2 className="font-display text-2xl font-semibold">Resumo</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cream/50">
              {fulfillment === "delivery" ? "entrega em ~45 min" : "retirada em ~25 min"}
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                placeholder="Cupom de desconto"
                className="min-w-0 flex-1 rounded-full border border-cream/20 bg-cream/8 px-4 py-2.5 text-sm uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-cream/40 focus:border-crust"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="rounded-full bg-crust px-4 py-2.5 text-sm font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {couponLoading ? "…" : "Aplicar"}
              </button>
            </div>

            {coupon && (
              <p className="mt-3 flex items-center gap-2 rounded-2xl bg-basil/25 px-3 py-2 text-xs font-semibold text-cream">
                <CheckIcon className="size-4" />
                {coupon.code} aplicado — {coupon.description}
              </p>
            )}
            {couponError && (
              <p className="mt-3 rounded-2xl bg-tomato/25 px-3 py-2 text-xs font-semibold text-cream">
                {couponError}
              </p>
            )}

            <dl className="mt-6 space-y-2.5 text-sm">
              <div className="flex justify-between text-cream/70">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-cream">{formatBRL(subtotalCents)}</dd>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between text-basil">
                  <dt>Desconto</dt>
                  <dd className="font-semibold">−{formatBRL(discountCents)}</dd>
                </div>
              )}
              <div className="flex justify-between text-cream/70">
                <dt>
                  {fulfillment === "delivery" ? "Taxa de entrega" : "Retirada no balcão"}
                </dt>
                <dd className="font-semibold text-cream">
                  {deliveryFeeCents === 0 && fulfillment === "delivery"
                    ? "Grátis"
                    : formatBRL(deliveryFeeCents)}
                </dd>
              </div>
              <div className="flex items-end justify-between border-t border-cream/12 pt-4">
                <dt className="font-display text-lg">Total</dt>
                <dd className="font-display text-3xl font-semibold text-crust">
                  {formatBRL(totalCents)}
                </dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-2xl bg-tomato px-4 py-3 text-sm font-semibold text-cream">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group mt-5 flex w-full items-center justify-between gap-3 rounded-full bg-tomato px-6 py-4 text-base font-bold text-cream transition-all hover:bg-tomato-dark active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? "Enviando pedido…" : "Confirmar pedido"}
              <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="mt-3 text-center text-xs text-cream/45">
              Ao confirmar você concorda com a política de cancelamento (até 5 min após o envio).
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
