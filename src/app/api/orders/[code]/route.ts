import { findOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  try {
    const found = await findOrder(code);
    if (!found) {
      return Response.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 });
    }
    return Response.json({ ok: true, order: found.order, items: found.items });
  } catch (error) {
    console.error("[api/orders/[code]]", error);
    return Response.json({ ok: false, error: "Falha ao consultar o pedido." }, { status: 500 });
  }
}
