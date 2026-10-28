import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { addons, coupons, products } from "@/db/schema";
import type { AddonChoice } from "@/db/schema";
import { STORE } from "@/lib/store";
import type { IncomingItem } from "@/lib/orders";

export type PricedLine = {
  productId: number;
  productName: string;
  imageUrl: string | null;
  sizeId: string;
  sizeLabel: string;
  unitPriceCents: number;
  quantity: number;
  selectedAddons: AddonChoice[];
  notes: string | null;
  totalCents: number;
};

export type PriceResult =
  | {
      ok: true;
      lines: PricedLine[];
      subtotalCents: number;
      discountCents: number;
      deliveryFeeCents: number;
      totalCents: number;
      couponCode: string | null;
      couponKind: string | null;
    }
  | { ok: false; error: string; status?: number };

export async function priceCart(
  items: IncomingItem[],
  fulfillment: "delivery" | "pickup",
  couponInput?: string | null,
): Promise<PriceResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "O carrinho está vazio.", status: 400 };
  }
  if (items.length > 40) {
    return { ok: false, error: "Limite de 40 itens por pedido.", status: 400 };
  }

  const productIds = [...new Set(items.map((i) => Number(i.productId)).filter(Boolean))];

  const productsFound = productIds.length
    ? await db.select().from(products).where(inArray(products.id, productIds))
    : [];
  const productById = new Map(productsFound.map((p) => [p.id, p]));

  const allAddons = await db.select().from(addons);
  const addonById = new Map(allAddons.map((a) => [a.id, a]));

  const lines: PricedLine[] = [];
  let subtotalCents = 0;

  for (const raw of items) {
    const product = productById.get(Number(raw.productId));
    if (!product) {
      return { ok: false, error: "Um dos itens não existe mais no cardápio.", status: 400 };
    }
    if (!product.available) {
      return { ok: false, error: `${product.name} está esgotado no momento.`, status: 409 };
    }

    const size = product.sizes.find((s) => s.id === String(raw.sizeId));
    if (!size) {
      return { ok: false, error: `Tamanho inválido para ${product.name}.`, status: 400 };
    }

    const quantity = Math.trunc(Number(raw.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return { ok: false, error: "Quantidade inválida (mínimo 1, máximo 20).", status: 400 };
    }

    const requestedAddonIds = Array.isArray(raw.addonIds)
      ? (raw.addonIds as unknown[])
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
      : [];
    const selectedAddons: AddonChoice[] = [];
    for (const addonId of new Set(requestedAddonIds)) {
      const addon = addonById.get(addonId);
      if (!addon) {
        return { ok: false, error: "Adicional inexistente.", status: 400 };
      }
      if (product.addonScope && addon.scope !== product.addonScope) {
        return {
          ok: false,
          error: `${addon.name} não pode ser adicionado a ${product.name}.`,
          status: 400,
        };
      }
      if (!product.addonScope) {
        return {
          ok: false,
          error: `${product.name} não aceita adicionais.`,
          status: 400,
        };
      }
      selectedAddons.push({
        id: addon.id,
        name: addon.name,
        priceCents: addon.priceCents,
      });
    }

    const unitPriceCents =
      size.priceCents + selectedAddons.reduce((sum, a) => sum + a.priceCents, 0);
    const notes = typeof raw.notes === "string" ? raw.notes.slice(0, 240) : null;

    subtotalCents += unitPriceCents * quantity;
    lines.push({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPriceCents,
      quantity,
      selectedAddons,
      notes: notes && notes.trim() ? notes.trim() : null,
      totalCents: unitPriceCents * quantity,
    });
  }

  if (subtotalCents < STORE.minOrderCents) {
    return {
      ok: false,
      error: `O pedido mínimo é de ${(STORE.minOrderCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}.`,
      status: 400,
    };
  }

  let discountCents = 0;
  let deliveryFeeCents = fulfillment === "pickup" ? 0 : STORE.deliveryFeeCents;
  let couponCode: string | null = null;
  let couponKind: string | null = null;

  if (fulfillment === "delivery" && subtotalCents >= STORE.freeDeliveryFromCents) {
    deliveryFeeCents = 0;
  }

  const code = typeof couponInput === "string" ? couponInput.trim().toUpperCase() : "";
  if (code) {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    if (!coupon || !coupon.active) {
      return { ok: false, error: "Cupom inválido ou expirado.", status: 400 };
    }
    if (subtotalCents < coupon.minSubtotalCents) {
      return {
        ok: false,
        error: `O cupom ${coupon.code} vale para pedidos acima de ${(
          coupon.minSubtotalCents / 100
        ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
        status: 400,
      };
    }
    couponCode = coupon.code;
    couponKind = coupon.kind;
    if (coupon.kind === "percent") {
      discountCents = Math.round((subtotalCents * coupon.value) / 100);
    } else if (coupon.kind === "amount") {
      discountCents = Math.min(coupon.value, subtotalCents);
    } else if (coupon.kind === "free_delivery") {
      deliveryFeeCents = 0;
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents + deliveryFeeCents);

  return {
    ok: true,
    lines,
    subtotalCents,
    discountCents,
    deliveryFeeCents,
    totalCents,
    couponCode,
    couponKind,
  };
}

export async function checkCoupon(code: string, subtotalCents: number) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false as const, error: "Informe um cupom." };
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, normalized));
  if (!coupon || !coupon.active) return { ok: false as const, error: "Cupom inválido ou expirado." };
  if (subtotalCents < coupon.minSubtotalCents) {
    return {
      ok: false as const,
      error: `Vale apenas para pedidos acima de ${(coupon.minSubtotalCents / 100).toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" },
      )}.`,
    };
  }
  let discountCents = 0;
  let freeDelivery = false;
  if (coupon.kind === "percent") discountCents = Math.round((subtotalCents * coupon.value) / 100);
  if (coupon.kind === "amount") discountCents = Math.min(coupon.value, subtotalCents);
  if (coupon.kind === "free_delivery") freeDelivery = true;
  return {
    ok: true as const,
    code: coupon.code,
    description: coupon.description,
    discountCents,
    freeDelivery,
  };
}
