import { createOrder } from "@/lib/orders";
import type { OrderInput } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<OrderInput>;
    const result = await createOrder({
      items: Array.isArray(body.items) ? body.items : [],
      customerName: String(body.customerName ?? ""),
      phone: String(body.phone ?? ""),
      fulfillment: body.fulfillment === "pickup" ? "pickup" : "delivery",
      street: body.street ?? null,
      houseNumber: body.houseNumber ?? null,
      complement: body.complement ?? null,
      district: body.district ?? null,
      reference: body.reference ?? null,
      paymentMethod:
        body.paymentMethod === "card" || body.paymentMethod === "cash"
          ? body.paymentMethod
          : "pix",
      cashChangeForCents:
        typeof body.cashChangeForCents === "number" ? body.cashChangeForCents : null,
      couponCode: body.couponCode ?? null,
      notes: body.notes ?? null,
    });

    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: result.status ?? 400 });
    }

    return Response.json({ ok: true, code: result.code, orderId: result.orderId });
  } catch (error) {
    console.error("[api/orders]", error);
    return Response.json(
      { ok: false, error: "Não foi possível registrar o pedido. Tente novamente." },
      { status: 500 },
    );
  }
}
