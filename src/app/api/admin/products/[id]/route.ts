import { isAdminRequest, unauthorized } from "@/lib/admin";
import { deleteProduct, updateProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function parseId(id: string) {
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Aceita tanto o ajuste rápido (disponível/destaque/preços) quanto a edição completa. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return unauthorized();
  const { id } = await context.params;
  const productId = parseId(id);
  if (!productId) {
    return Response.json({ ok: false, error: "Produto inválido." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await updateProduct(productId, body);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 400 });
    }
    return Response.json({ ok: true, product: result.product });
  } catch (error) {
    console.error("[api/admin/products/[id] PATCH]", error);
    return Response.json({ ok: false, error: "Falha ao atualizar o produto." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return unauthorized();
  const { id } = await context.params;
  const productId = parseId(id);
  if (!productId) {
    return Response.json({ ok: false, error: "Produto inválido." }, { status: 400 });
  }

  try {
    const result = await deleteProduct(productId);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 404 });
    }
    return Response.json({ ok: true, id: result.id });
  } catch (error) {
    console.error("[api/admin/products/[id] DELETE]", error);
    return Response.json({ ok: false, error: "Falha ao remover o produto." }, { status: 500 });
  }
}
