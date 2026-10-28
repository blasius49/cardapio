import { getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menu = await getMenu();
    return Response.json({ ok: true, ...menu });
  } catch (error) {
    console.error("[api/menu]", error);
    return Response.json(
      { ok: false, error: "Não foi possível carregar o cardápio." },
      { status: 500 },
    );
  }
}
