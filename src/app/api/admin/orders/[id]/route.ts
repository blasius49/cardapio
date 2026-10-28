import { isAdminRequest, unauthorized } from "@/lib/admin";
import { updateOrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return unauthorized();
  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return Response.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { status?: unknown };
    const result = await updateOrderStatus(orderId, String(body.status ?? ""));
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }
    return Response.json({ ok: true, order: result.order });
  } catch (error) {
    console.error("[api/admin/orders/[id]]", error);
    return Response.json({ ok: false, error: "Falha ao atualizar o status." }, { status: 500 });
  }
}
