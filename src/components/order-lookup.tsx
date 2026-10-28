"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, ScooterIcon } from "@/components/icons";

export function OrderLookup() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 5) {
      setError("Digite o código que apareceu na confirmação (ex.: FD-1A2B3).");
      return;
    }
    setError(null);
    router.push(`/pedido/${encodeURIComponent(normalized)}`);
  };

  return (
    <section id="acompanhar" className="scroll-mt-40 bg-sand py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-ink/10 bg-mozzarella shadow-[0_30px_70px_rgba(28,18,16,0.1)]">
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-basil">
                <ScooterIcon className="size-4" />
                rastreamento
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Já pediu? Acompanhe sua pizza
              </h2>
              <p className="mt-3 text-sm text-ink/65">
                Informe o código recebido na confirmação e veja em que etapa do forno ela está.
              </p>

              <form onSubmit={submit} className="mt-6">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="FD-1A2B3"
                    aria-label="Código do pedido"
                    className="flex-1 rounded-full border border-ink/15 bg-cream px-5 py-3.5 font-mono text-base uppercase tracking-[0.14em] outline-none transition-colors placeholder:tracking-normal placeholder:text-ink/35 focus:border-tomato"
                  />
                  <button
                    type="submit"
                    className="group flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-cream transition-colors hover:bg-tomato"
                  >
                    Acompanhar
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
                {error && <p className="mt-3 text-sm font-semibold text-tomato">{error}</p>}
              </form>
            </div>

            <div className="relative hidden bg-ink md:block">
              <div
                aria-hidden
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(320px 220px at 70% 20%, rgba(224,163,62,0.4), transparent 65%)",
                }}
              />
              <div className="relative flex h-full flex-col justify-center gap-5 p-10 text-cream">
                {["recebido", "na bancada", "no forno", "saiu para entrega"].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span
                      className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                        index === 3 ? "bg-tomato text-cream" : "bg-cream/12 text-cream/70"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold uppercase tracking-wide ${
                        index === 3 ? "text-crust" : "text-cream/60"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
