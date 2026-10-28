import { isAdminRequest, unauthorized } from "@/lib/admin";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    const orders = await listOrders(80);
    return Response.json({ ok: true, orders });
  } catch (error) {
    console.error("[api/admin/orders]", error);
    return Response.json({ ok: false, error: "Falha ao listar pedidos." }, { status: 500 });
  }
}
