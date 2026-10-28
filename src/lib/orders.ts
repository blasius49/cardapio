import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import type { Order, OrderItem } from "@/db/schema";
import { priceCart } from "@/lib/pricing";
import { maskPhone } from "@/lib/store";
import type { OrderStatus } from "@/lib/store";

export type IncomingItem = {
  productId: number;
  sizeId: string;
  quantity: number;
  addonIds?: number[];
  notes?: string | null;
};

export type OrderInput = {
  items: IncomingItem[];
  customerName: string;
  phone: string;
  fulfillment: "delivery" | "pickup";
  street?: string | null;
  houseNumber?: string | null;
  complement?: string | null;
  district?: string | null;
  reference?: string | null;
  paymentMethod: "pix" | "card" | "cash";
  cashChangeForCents?: number | null;
  couponCode?: string | null;
  notes?: string | null;
};

const VALID_STATUSES: OrderStatus[] = [
  "received",
  "preparing",
  "oven",
  "delivering",
  "completed",
  "cancelled",
];

function clean(value: unknown, max = 160) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed ? trimmed : null;
}

export function generateOrderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `FD-${suffix}`;
}

export type CreateOrderResult =
  | { ok: true; code: string; orderId: number }
  | { ok: false; error: string; status?: number };

export async function createOrder(input: OrderInput): Promise<CreateOrderResult> {
  const customerName = clean(input.customerName, 90);
  const phoneDigits = typeof input.phone === "string" ? input.phone.replace(/\D/g, "") : "";

  if (!customerName || customerName.length < 3) {
    return { ok: false, error: "Informe seu nome completo.", status: 400 };
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return { ok: false, error: "Informe um telefone com DDD.", status: 400 };
  }

  const fulfillment = input.fulfillment === "pickup" ? "pickup" : "delivery";
  const paymentMethod = (["pix", "card", "cash"] as const).includes(
    input.paymentMethod as "pix" | "card" | "cash",
  )
    ? (input.paymentMethod as "pix" | "card" | "cash")
    : "pix";

  let street: string | null = null;
  let houseNumber: string | null = null;
  let district: string | null = null;

  if (fulfillment === "delivery") {
    street = clean(input.street, 160);
    houseNumber = clean(input.houseNumber, 20);
    district = clean(input.district, 90);
    if (!street || !houseNumber || !district) {
      return {
        ok: false,
        error: "Para entrega, preencha rua, número e bairro.",
        status: 400,
      };
    }
  }

  const cashChangeForCents =
    paymentMethod === "cash" && typeof input.cashChangeForCents === "number"
      ? Math.max(0, Math.round(input.cashChangeForCents))
      : null;

  const priced = await priceCart(input.items ?? [], fulfillment, input.couponCode ?? null);
  if (!priced.ok) return { ok: false, error: priced.error, status: priced.status ?? 400 };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = generateOrderCode();
    try {
      const result = await db.transaction(async (tx) => {
        const [order] = await tx
          .insert(orders)
          .values({
            code,
            customerName,
            phone: maskPhone(phoneDigits),
            fulfillment,
            street,
            houseNumber,
            complement: fulfillment === "delivery" ? clean(input.complement, 120) : null,
            district,
            reference: fulfillment === "delivery" ? clean(input.reference, 160) : null,
            paymentMethod,
            cashChangeForCents,
            couponCode: priced.couponCode,
            notes: clean(input.notes, 300),
            subtotalCents: priced.subtotalCents,
            discountCents: priced.discountCents,
            deliveryFeeCents: priced.deliveryFeeCents,
            totalCents: priced.totalCents,
            status: "received",
          })
          .returning({ id: orders.id });

        await tx.insert(orderItems).values(
          priced.lines.map((line) => ({
            orderId: order.id,
            productId: line.productId,
            productName: line.productName,
            imageUrl: line.imageUrl,
            sizeId: line.sizeId,
            sizeLabel: line.sizeLabel,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
            selectedAddons: line.selectedAddons,
            notes: line.notes,
            totalCents: line.totalCents,
          })),
        );

        return { id: order.id, code };
      });

      return { ok: true, code: result.code, orderId: result.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("duplicate key") || message.includes("orders_code_key")) {
        continue;
      }
      throw error;
    }
  }

  return { ok: false, error: "Não foi possível gerar o código do pedido. Tente novamente.", status: 500 };
}

export async function findOrder(code: string) {
  const [order] = await db.select().from(orders).where(eq(orders.code, code.toUpperCase().trim()));
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id));
  return { order, items };
}

export async function listOrders(limit = 60) {
  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  if (rows.length === 0) return [] as { order: Order; items: OrderItem[] }[];
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((r) => r.id)))
    .orderBy(asc(orderItems.id));
  const byOrder = new Map<number, OrderItem[]>();
  for (const item of items) {
    const bucket = byOrder.get(item.orderId) ?? [];
    bucket.push(item);
    byOrder.set(item.orderId, bucket);
  }
  return rows.map((order) => ({ order, items: byOrder.get(order.id) ?? [] }));
}

export async function updateOrderStatus(orderId: number, status: string) {
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return { ok: false as const, error: "Status inválido." };
  }
  const [updated] = await db
    .update(orders)
    .set({ status, statusUpdatedAt: new Date(), updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  if (!updated) return { ok: false as const, error: "Pedido não encontrado." };
  return { ok: true as const, order: updated };
}
