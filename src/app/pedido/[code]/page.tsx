import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OrderTracker } from "@/components/order-tracker";
import { PizzaIcon, SearchIcon } from "@/components/icons";
import { computeOpenNow } from "@/lib/hours";
import { findOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acompanhar pedido · Forno d'Oro",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const found = await findOrder(code);

  return (
    <>
      <Header openNow={computeOpenNow()} />
      {found ? (
        <OrderTracker
          initialOrder={found.order}
          initialItems={found.items}
          isNew={query.novo === "1"}
        />
      ) : (
        <main className="bg-paper grid min-h-[70vh] place-items-center px-4 py-16">
          <div className="max-w-md text-center">
            <span className="mx-auto grid size-24 place-items-center rounded-full bg-sand text-tomato">
              <PizzaIcon className="size-12" strokeWidth={1.2} />
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold">
              Não achamos o pedido <span className="font-mono text-2xl">{code}</span>
            </h1>
            <p className="mt-3 text-ink/60">
              Confira o código que enviamos na confirmação — ele começa sempre com FD-.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/#acompanhar"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-cream hover:bg-tomato"
              >
                <SearchIcon className="size-4" />
                Tentar outro código
              </Link>
              <Link
                href="/pedido/FD-1001"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3.5 text-sm font-bold text-ink hover:border-tomato hover:text-tomato"
              >
                Ver pedido de exemplo
              </Link>
            </div>
          </div>
        </main>
      )}
      <Footer />
    </>
  );
}
