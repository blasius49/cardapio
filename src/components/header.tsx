"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { CartIcon, CloseIcon, PhoneIcon, PizzaIcon } from "@/components/icons";
import { STORE } from "@/lib/store";

const LINKS = [
  { href: "#cardapio", label: "Cardápio" },
  { href: "#destaques", label: "Mais pedidas" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#acompanhar", label: "Acompanhar pedido" },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={STORE.name}>
      <span className="relative grid size-11 place-items-center rounded-full bg-tomato text-cream shadow-[0_8px_20px_rgba(200,52,29,0.35)] transition-transform duration-300 group-hover:rotate-12">
        <PizzaIcon className="size-6" strokeWidth={1.4} />
        <span
          className={`absolute -right-0.5 -top-0.5 size-3 rounded-full bg-crust ring-2 ${
            dark ? "ring-ink" : "ring-cream"
          }`}
        />
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-xl font-semibold tracking-tight ${
            dark ? "text-cream" : "text-ink"
          }`}
        >
          Forno d&rsquo;Oro
        </span>
        <span
          className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-crust" : "text-tomato"
          }`}
        >
          Pizzeria napoletana
        </span>
      </span>
    </Link>
  );
}

export function Header({ openNow }: { openNow: boolean }) {
  const pathname = usePathname();
  const { count, openCart, bump } = useCart();
  const href = (anchor: string) => (pathname === "/" ? anchor : `/${anchor}`);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (bump === 0) return;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 600);
    return () => window.clearTimeout(timer);
  }, [bump]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[12px] sm:px-6">
          <p className="flex items-center gap-2 font-medium">
            <span
              className={`size-2 rounded-full ${openNow ? "bg-basil" : "bg-crust"} animate-pulse`}
            />
            {openNow ? "Aberto agora · pedidos até 23h30" : "Fechado agora · abrimos às 18h"}
          </p>
          <p className="hidden items-center gap-2 sm:flex">
            <span className="text-crust">Cupom</span>
            <span className="rounded bg-cream/10 px-1.5 py-0.5 font-semibold tracking-wide">
              PRIMEIRAFATIA
            </span>
            <span className="text-cream/70">10% off no primeiro pedido</span>
          </p>
        </div>
      </div>

      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-ink/10 bg-cream/95 shadow-[0_10px_30px_rgba(28,18,16,0.08)] backdrop-blur"
            : "border-transparent bg-cream"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={href(link.href)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-sand hover:text-tomato"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:+55${STORE.phone.replace(/\D/g, "")}`}
              className="hidden items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-tomato hover:text-tomato md:flex"
            >
              <PhoneIcon className="size-4" />
              {STORE.phone}
            </a>

            <button
              type="button"
              onClick={openCart}
              className={`relative flex items-center gap-2 rounded-full bg-tomato px-4 py-2.5 text-sm font-bold text-cream shadow-[0_10px_24px_rgba(200,52,29,0.32)] transition-all hover:bg-tomato-dark active:scale-95 ${
                pulse ? "scale-110" : ""
              }`}
            >
              <CartIcon className="size-5" strokeWidth={1.8} />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="grid size-6 place-items-center rounded-full bg-cream text-xs font-extrabold text-tomato">
                {count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="grid size-11 place-items-center rounded-full border border-ink/15 text-ink lg:hidden"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileOpen ? (
                <CloseIcon className="size-5" />
              ) : (
                <span className="flex flex-col gap-1">
                  <span className="block h-0.5 w-5 rounded bg-ink" />
                  <span className="block h-0.5 w-5 rounded bg-ink" />
                  <span className="block h-0.5 w-3.5 rounded bg-ink" />
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="animate-pop-in border-t border-ink/10 bg-cream px-4 pb-4 pt-2 lg:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={href(link.href)}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-3 py-3 text-base font-semibold text-ink-soft hover:bg-sand"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-3 py-3 text-base font-semibold text-ink-soft hover:bg-sand"
            >
              Painel da pizzaria
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
