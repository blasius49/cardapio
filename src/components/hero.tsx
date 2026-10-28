import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  FlameIcon,
  LeafIcon,
  ScooterIcon,
  StarIcon,
} from "@/components/icons";
import type { MenuProduct } from "@/lib/types";
import { formatBRL, STORE } from "@/lib/store";

const MARQUEE = [
  "Forno a lenha 400 °C",
  "Fermentação natural 48h",
  "Farinha Caputo 00",
  "Tomate San Marzano",
  "Mussarela fior di latte",
  "Manjericão colhido hoje",
  "Entrega em 45 min",
  "Sem conservantes",
];

function cheapest(product: MenuProduct) {
  return product.sizes.reduce(
    (min, size) => (size.priceCents < min ? size.priceCents : min),
    product.sizes[0]?.priceCents ?? 0,
  );
}

export function Hero({ featured }: { featured: MenuProduct[] }) {
  const hero = featured.find((p) => p.slug === "margherita") ?? featured[0];
  const second = featured.find((p) => p.slug === "pepperoni-suprema") ?? featured[1] ?? hero;
  const heroSize = hero?.sizes.find((s) => s.id === "g") ?? hero?.sizes[hero.sizes.length - 1];

  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(1100px 520px at 82% 18%, rgba(224,163,62,0.28), transparent 60%), radial-gradient(760px 420px at 8% 82%, rgba(200,52,29,0.42), transparent 62%)",
        }}
      />
      <div aria-hidden className="bg-checker pointer-events-none absolute inset-0 opacity-[0.07]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-crust">
            <LeafIcon className="size-4" />
            Vila Madalena · desde 1998
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.6rem,6.4vw,4.6rem)] font-semibold leading-[0.95] tracking-tight">
            A pizza chega
            <span className="block text-crust italic">cantando de quente</span>
            na sua mesa.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
            Massa fermentada por 48 horas, molho de tomate San Marzano e 90 segundos de forno a
            lenha. Monte o pedido pelo cardápio online e acompanhe cada etapa em tempo real.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#cardapio"
              className="group inline-flex items-center gap-2 rounded-full bg-tomato px-7 py-4 text-base font-bold text-cream shadow-[0_16px_36px_rgba(200,52,29,0.45)] transition-all hover:bg-tomato-dark active:scale-[0.97]"
            >
              Ver cardápio completo
              <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#acompanhar"
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-7 py-4 text-base font-semibold text-cream transition-colors hover:border-crust hover:text-crust"
            >
              <ScooterIcon className="size-5" />
              Acompanhar pedido
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {[
              { icon: StarIcon, value: "4,9", label: "2.487 avaliações" },
              { icon: ClockIcon, value: "45 min", label: "entrega média" },
              { icon: FlameIcon, value: "400 °C", label: "forno a lenha" },
              { icon: LeafIcon, value: "48h", label: "fermentação" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="flex items-center gap-2 text-crust">
                  <stat.icon className="size-4" />
                  <span className="font-display text-xl font-semibold text-cream">
                    {stat.value}
                  </span>
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-cream/55">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative aspect-square">
            <div
              aria-hidden
              className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-cream/25"
            />
            <div
              aria-hidden
              className="absolute inset-6 rounded-full bg-gradient-to-br from-crust/40 via-tomato/30 to-transparent blur-2xl"
            />
            <div className="absolute inset-[9%] overflow-hidden rounded-full ring-8 ring-cream/10">
              {hero?.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero.imageUrl}
                  alt={hero.name}
                  className="size-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              )}
            </div>

            <div className="absolute -left-2 top-[12%] animate-fade-up rounded-2xl bg-cream px-4 py-3 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.4)] sm:-left-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-tomato">
                mais pedida hoje
              </p>
              <p className="font-display text-lg font-semibold leading-tight">{hero?.name}</p>
              <p className="text-xs text-ink/60">
                {heroSize?.label} · {formatBRL(heroSize?.priceCents ?? 0)}
              </p>
            </div>

            {second && (
              <div className="absolute -right-1 bottom-[14%] flex animate-fade-up items-center gap-3 rounded-2xl bg-ink/85 p-3 pr-5 text-cream shadow-[0_18px_40px_rgba(0,0,0,0.5)] ring-1 ring-cream/15 backdrop-blur sm:-right-4">
                <span className="grid size-10 place-items-center rounded-full bg-basil/25 text-basil">
                  <ScooterIcon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold">Entrega grátis</span>
                  <span className="block text-xs text-cream/60">
                    acima de {formatBRL(STORE.freeDeliveryFromCents)}
                  </span>
                </span>
              </div>
            )}

            <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-crust px-5 py-2 text-sm font-bold text-ink shadow-lg">
              <FlameIcon className="size-4 animate-flame" />
              saindo do forno agora
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-y border-cream/12 bg-ink-soft/60 py-3">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.2em] text-cream/60"
            >
              {item}
              <span className="text-tomato">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
