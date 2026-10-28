import Link from "next/link";
import {
  CardIcon,
  CashIcon,
  ChefIcon,
  ClockIcon,
  FlameIcon,
  NoteIcon,
  PixIcon,
  PinIcon,
  ScooterIcon,
  SparkIcon,
  StoreIcon,
} from "@/components/icons";
import { formatBRL, STORE } from "@/lib/store";

const STEPS = [
  {
    icon: ChefIcon,
    title: "Escolha e personalize",
    text: "Três tamanhos de pizza, adicionais por grupo e recado direto para o pizzaiolo.",
  },
  {
    icon: NoteIcon,
    title: "Confirme em 30 segundos",
    text: "Entrega ou retirada, PIX, cartão na entrega ou dinheiro com troco. Cupom aplicado na hora.",
  },
  {
    icon: ScooterIcon,
    title: "Acompanhe em tempo real",
    text: "Da bancada ao forno a lenha, até a sua porta — com código de rastreio do pedido.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-40 bg-ink py-16 text-cream sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-crust">
              <SparkIcon className="size-4" />
              como funciona
            </span>
            <h2 className="mt-4 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.02] tracking-tight">
              Do pedido à porta em
              <span className="text-crust italic"> três passos</span>
            </h2>
            <p className="mt-4 max-w-md text-cream/70">
              A cozinha recebe o pedido com cada detalhe impresso: tamanho, adicionais, observações
              e forma de pagamento. Nada de telefone ocupado.
            </p>

            <div className="mt-8 rounded-3xl border border-cream/15 bg-cream/5 p-6">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-crust">
                <FlameIcon className="size-4" />
                cupom de primeira viagem
              </p>
              <p className="mt-3 font-display text-3xl font-semibold">PRIMEIRAFATIA</p>
              <p className="mt-2 text-sm text-cream/65">
                10% de desconto aplicado no checkout, sem valor mínimo.
              </p>
            </div>
          </div>

          <ol className="space-y-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="group relative flex gap-5 rounded-3xl border border-cream/12 bg-cream/[0.04] p-6 transition-colors hover:border-crust/50 hover:bg-cream/[0.08]"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-tomato text-cream shadow-[0_14px_30px_rgba(200,52,29,0.35)]">
                  <step.icon className="size-7" strokeWidth={1.4} />
                </span>
                <div>
                  <span className="font-display text-sm font-semibold text-crust">
                    passo {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ServiceInfo() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3">
        <div className="rounded-[28px] border border-ink/10 bg-mozzarella p-7">
          <span className="grid size-12 place-items-center rounded-2xl bg-basil/15 text-basil">
            <ScooterIcon className="size-6" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-semibold">Entrega & retirada</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li className="flex items-start gap-2">
              <PinIcon className="mt-0.5 size-4 shrink-0 text-tomato" />
              Vila Madalena, Pinheiros, Perdizes, Pompeia e Butantã
            </li>
            <li className="flex items-start gap-2">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-tomato" />
              Tempo médio de {STORE.etaMinutes} min da confirmação à porta
            </li>
            <li className="flex items-start gap-2">
              <CardIcon className="mt-0.5 size-4 shrink-0 text-tomato" />
              Taxa {formatBRL(STORE.deliveryFeeCents)} · grátis acima de{" "}
              {formatBRL(STORE.freeDeliveryFromCents)}
            </li>
            <li className="flex items-start gap-2">
              <StoreIcon className="mt-0.5 size-4 shrink-0 text-tomato" />
              Retirada no balcão sem taxa, em 25 min
            </li>
          </ul>
        </div>

        <div className="rounded-[28px] border border-ink/10 bg-mozzarella p-7">
          <span className="grid size-12 place-items-center rounded-2xl bg-tomato/12 text-tomato">
            <PixIcon className="size-6" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-semibold">Pagamento</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink/70">
            <li className="flex items-center gap-3">
              <PixIcon className="size-5 text-ink/45" />
              PIX com confirmação automática
            </li>
            <li className="flex items-center gap-3">
              <CardIcon className="size-5 text-ink/45" />
              Cartão de crédito ou débito na entrega
            </li>
            <li className="flex items-center gap-3">
              <CashIcon className="size-5 text-ink/45" />
              Dinheiro — informe o troco no pedido
            </li>
          </ul>
          <p className="mt-5 rounded-2xl bg-sand/70 px-4 py-3 text-xs font-semibold text-ink/65">
            Pedido mínimo de {formatBRL(STORE.minOrderCents)} para entregas.
          </p>
        </div>

        <div className="rounded-[28px] border border-ink/10 bg-mozzarella p-7">
          <span className="grid size-12 place-items-center rounded-2xl bg-crust/25 text-ink">
            <ClockIcon className="size-6" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-semibold">Horários</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {STORE.hours.map((entry) => (
              <li key={entry.day} className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink/75">{entry.day}</span>
                <span className="text-ink/55">{entry.time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-ink/65">{STORE.address}</p>
          <Link
            href="/pedido/FD-1001"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-tomato hover:text-tomato-dark"
          >
            Ver um pedido de exemplo
            <SparkIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
