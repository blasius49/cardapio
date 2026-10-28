import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { computeOpenNow } from "@/lib/hours";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finalizar pedido · Forno d'Oro",
};

export default function CheckoutPage() {
  return (
    <>
      <Header openNow={computeOpenNow()} />
      <main className="bg-paper min-h-[70vh]">
        <CheckoutForm />
      </main>
      <Footer />
    </>
  );
}
