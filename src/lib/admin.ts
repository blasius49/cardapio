export const ADMIN_PIN = process.env.ADMIN_PIN ?? "1234";

export function isAdminRequest(request: Request) {
  const header = request.headers.get("x-admin-pin");
  const query = new URL(request.url).searchParams.get("pin");
  return header === ADMIN_PIN || query === ADMIN_PIN;
}

export function unauthorized() {
  return Response.json(
    { ok: false, error: "Acesso restrito. Confira o PIN do painel." },
    { status: 401 },
  );
}
