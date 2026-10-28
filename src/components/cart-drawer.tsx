"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";
import {
  ArrowRightIcon,
  CartIcon,
  CloseIcon,
  MinusIcon,
  PizzaIcon,
  PlusIcon,
  ScooterIcon,
  TrashIcon,
} from "@/components/icons";
import { formatBRL, STORE } from "@/lib/store";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotalCents, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const remaining = Math.max(0, STORE.freeDeliveryFromCents - subtotalCents);
  const progress = Math.min(100, (subtotalCents / STORE.freeDeliveryFromCents) * 100);

  const goCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar carrinho"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />

      <aside className="animate-slide-left relative flex h-full w-full max-w-md flex-col bg-cream shadow-[-30px_0_80px_rgba(0,0,0,0.35)]">
        <header className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-tomato text-cream">
              <CartIcon className="size-5" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold leading-none">Seu pedido</h2>
              <p className="mt-1 text-xs text-ink/55">
                {count === 0 ? "carrinho vazio" : `${count} ${count === 1 ? "item" : "itens"}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fechar"
            className="grid size-10 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-sand"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid size-24 place-items-center rounded-full bg-sand text-tomato">
              <PizzaIcon className="size-12" strokeWidth={1.2} />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold">Seu carrinho está vazio</p>
              <p className="mt-2 text-sm text-ink/60">
                Que tal uma Margherita D.O.P. saindo do forno a lenha?
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream transition-colors hover:bg-tomato"
            >
              Explorar o cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-ink/10 bg-mozzarella px-5 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                <ScooterIcon className="size-4 text-basil" />
                {remaining > 0 ? (
                  <span>
                    Faltam <strong className="text-tomato">{formatBRL(remaining)}</strong> para a
                    entrega ficar por nossa conta
                  </span>
                ) : (
                  <span className="text-basil">Entrega grátis liberada para este pedido 🎉</span>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-crust to-tomato transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-3 rounded-3xl border border-ink/10 bg-mozzarella p-3"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-sand">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-semibold leading-tight">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remover ${item.name}`}
                        className="text-ink/35 transition-colors hover:text-tomato"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-ink/55">{item.sizeLabel}</p>
                    {item.addons.length > 0 && (
                      <p className="mt-1 text-xs text-basil">
                        + {item.addons.map((addon) => addon.name).join(", ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="mt-1 text-xs italic text-ink/50">“{item.notes}”</p>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-cream p-0.5">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="grid size-7 place-items-center rounded-full transition-colors hover:bg-sand"
                          aria-label="Diminuir"
                        >
                          <MinusIcon className="size-3.5" strokeWidth={2.4} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="grid size-7 place-items-center rounded-full transition-colors hover:bg-sand"
                          aria-label="Aumentar"
                        >
                          <PlusIcon className="size-3.5" strokeWidth={2.4} />
                        </button>
                      </div>
                      <span className="font-display text-base font-semibold">
                        {formatBRL(item.unitPriceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-ink/10 bg-cream px-5 pb-5 pt-4">
              <div className="flex items-center justify-between text-sm text-ink/65">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">{formatBRL(subtotalCents)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm text-ink/65">
                <span>Entrega</span>
                <span className="font-semibold text-ink/70">calculada no checkout</span>
              </div>
              {subtotalCents < STORE.minOrderCents && (
                <p className="mt-3 rounded-xl bg-crust/25 px-3 py-2 text-xs font-semibold text-ink/75">
                  Pedido mínimo de {formatBRL(STORE.minOrderCents)} para entrega.
                </p>
              )}

              <button
                type="button"
                onClick={goCheckout}
                className="group mt-4 flex w-full items-center justify-between gap-3 rounded-full bg-tomato px-6 py-4 text-base font-bold text-cream transition-all hover:bg-tomato-dark active:scale-[0.98]"
              >
                Finalizar pedido
                <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
