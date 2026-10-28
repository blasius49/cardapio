import { isAdminRequest, unauthorized } from "@/lib/admin";
import { createProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createProduct(body);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }
    return Response.json({ ok: true, product: result.product });
  } catch (error) {
    console.error("[api/admin/products POST]", error);
    return Response.json(
      { ok: false, error: "Não foi possível cadastrar o item." },
      { status: 500 },
    );
  }
}
