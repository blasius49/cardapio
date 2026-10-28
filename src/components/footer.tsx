import Link from "next/link";
import { Logo } from "@/components/header";
import {
  InstagramIcon,
  PhoneIcon,
  PinIcon,
  SlidersIcon,
  WhatsappIcon,
} from "@/components/icons";
import { STORE } from "@/lib/store";

export function Footer() {
  return (
    <footer className="bg-ink pb-8 pt-16 text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
              {STORE.tagline}. Forno a lenha aceso todos os dias desde 1998, na esquina mais
              cheirosa da Vila Madalena.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid size-11 place-items-center rounded-full border border-cream/20 text-cream/75 transition-colors hover:border-basil hover:text-basil"
              >
                <WhatsappIcon className="size-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid size-11 place-items-center rounded-full border border-cream/20 text-cream/75 transition-colors hover:border-crust hover:text-crust"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href={`tel:+55${STORE.phone.replace(/\D/g, "")}`}
                aria-label="Telefone"
                className="grid size-11 place-items-center rounded-full border border-cream/20 text-cream/75 transition-colors hover:border-tomato hover:text-tomato"
              >
                <PhoneIcon className="size-5" />
              </a>
            </div>
          </div>

          <nav>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-crust">Cardápio</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/65">
              {[
                { href: "#tradicionais", label: "Pizzas Tradicionais" },
                { href: "#especiais", label: "Especiais da Casa" },
                { href: "#doces", label: "Pizzas Doces" },
                { href: "#bebidas", label: "Bebidas" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-crust">Pedidos</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/65">
              <li>
                <Link href="/checkout" className="transition-colors hover:text-cream">
                  Finalizar carrinho
                </Link>
              </li>
              <li>
                <Link href="#acompanhar" className="transition-colors hover:text-cream">
                  Acompanhar pedido
                </Link>
              </li>
              <li>
                <Link href="/pedido/FD-1001" className="transition-colors hover:text-cream">
                  Pedido de exemplo
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 transition-colors hover:text-cream"
                >
                  <SlidersIcon className="size-4" />
                  Painel da pizzaria
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-crust">Onde estamos</h3>
            <p className="mt-4 flex gap-2 text-sm text-cream/65">
              <PinIcon className="mt-0.5 size-4 shrink-0 text-tomato" />
              {STORE.address}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-cream/65">
              {STORE.hours.map((entry) => (
                <li key={entry.day} className="flex justify-between gap-3">
                  <span>{entry.day}</span>
                  <span className="text-cream/45">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/12 pt-6 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Forno d&rsquo;Oro Pizzeria · CNPJ 12.345.678/0001-90</p>
          <p>Cardápio digital com pedidos salvos em PostgreSQL.</p>
        </div>
      </div>
    </footer>
  );
}
