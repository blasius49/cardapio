import { checkCoupon } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: unknown; subtotalCents?: unknown };
    const subtotal = Number(body.subtotalCents);
    const result = await checkCoupon(String(body.code ?? ""), Number.isFinite(subtotal) ? subtotal : 0);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }
    return Response.json(result);
  } catch (error) {
    console.error("[api/coupons]", error);
    return Response.json({ ok: false, error: "Falha ao validar o cupom." }, { status: 500 });
  }
}
