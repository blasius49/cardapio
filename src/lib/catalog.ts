import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import type { ProductSize } from "@/db/schema";

export type ProductDraft = {
  name: string;
  description: string;
  categoryId: number;
  imageUrl: string | null;
  addonScope: "salgada" | "doce" | null;
  sizes: ProductSize[];
  tags: string[];
  featured: boolean;
  available: boolean;
};

export type DraftResult =
  | { ok: true; draft: ProductDraft }
  | { ok: false; error: string };

export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

function str(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseSizes(raw: unknown): ProductSize[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 4) return null;
  const fallbackIds = ["p", "m", "g", "xg"];
  const sizes: ProductSize[] = [];
  const usedIds = new Set<string>();

  for (let index = 0; index < raw.length; index += 1) {
    const entry = raw[index] as Record<string, unknown>;
    const label = str(entry?.label, 40);
    if (label.length < 1) return null;

    const price = Math.round(Number(entry?.priceCents));
    if (!Number.isFinite(price) || price < 100 || price > 100000) return null;

    let id = slugify(str(entry?.id, 12));
    if (!id || usedIds.has(id)) id = fallbackIds[index] ?? `s${index + 1}`;
    while (usedIds.has(id)) id = `${id}2`;
    usedIds.add(id);

    sizes.push({
      id,
      label,
      detail: str(entry?.detail, 60),
      priceCents: price,
    });
  }

  return sizes;
}

export function normalizeDraft(raw: Record<string, unknown>): DraftResult {
  const name = str(raw.name, 80);
  if (name.length < 2) return { ok: false, error: "Informe um nome com pelo menos 2 letras." };

  const categoryId = Number(raw.categoryId);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { ok: false, error: "Escolha uma categoria." };
  }

  const sizes = parseSizes(raw.sizes);
  if (!sizes) {
    return {
      ok: false,
      error: "Cadastre de 1 a 4 tamanhos com preço entre R$ 1,00 e R$ 1.000,00.",
    };
  }

  let imageUrl: string | null = null;
  if (typeof raw.imageUrl === "string" && raw.imageUrl.trim()) {
    const candidate = raw.imageUrl.trim().slice(0, 600);
    if (!/^https?:\/\//i.test(candidate)) {
      return { ok: false, error: "A imagem precisa ser uma URL http(s)." };
    }
    imageUrl = candidate;
  }

  const scopeRaw = raw.addonScope;
  const addonScope =
    scopeRaw === "salgada" || scopeRaw === "doce" ? scopeRaw : null;

  const tagsRaw = Array.isArray(raw.tags) ? raw.tags : [];
  const tags = tagsRaw
    .map((tag) => str(tag, 24))
    .filter(Boolean)
    .slice(0, 5);

  return {
    ok: true,
    draft: {
      name,
      description: str(raw.description, 300),
      categoryId,
      imageUrl,
      addonScope,
      sizes,
      tags,
      featured: raw.featured === true,
      available: raw.available !== false,
    },
  };
}

async function categoryExists(id: number) {
  const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id));
  return Boolean(row);
}

async function uniqueSlug(base: string, ignoreId?: number) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const condition = ignoreId
      ? and(eq(products.slug, candidate), ne(products.id, ignoreId))
      : eq(products.slug, candidate);
    const [existing] = await db.select({ id: products.id }).from(products).where(condition);
    if (!existing) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export type CreateProductResult =
  | { ok: true; product: typeof products.$inferSelect }
  | { ok: false; error: string };

export async function createProduct(raw: Record<string, unknown>): Promise<CreateProductResult> {
  const parsed = normalizeDraft(raw);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { draft } = parsed;
  if (!(await categoryExists(draft.categoryId))) {
    return { ok: false, error: "Categoria inexistente." };
  }

  const slug = await uniqueSlug(slugify(draft.name));
  const [{ maxPosition }] = await db
    .select({
      maxPosition: sql<number>`coalesce(max(${products.position}), 0)::int`,
    })
    .from(products)
    .where(eq(products.categoryId, draft.categoryId));

  const [created] = await db
    .insert(products)
    .values({
      categoryId: draft.categoryId,
      name: draft.name,
      slug,
      description: draft.description,
      imageUrl: draft.imageUrl,
      addonScope: draft.addonScope,
      sizes: draft.sizes,
      tags: draft.tags,
      featured: draft.featured,
      available: draft.available,
      position: maxPosition + 1,
    })
    .returning();

  return { ok: true, product: created };
}

export async function updateProduct(
  id: number,
  raw: Record<string, unknown>,
): Promise<CreateProductResult> {
  const [current] = await db.select().from(products).where(eq(products.id, id));
  if (!current) return { ok: false, error: "Produto não encontrado." };

  const merged: Record<string, unknown> = {
    name: raw.name ?? current.name,
    description: raw.description ?? current.description,
    categoryId: raw.categoryId ?? current.categoryId,
    imageUrl: raw.imageUrl ?? current.imageUrl ?? "",
    addonScope: "addonScope" in raw ? raw.addonScope : current.addonScope,
    sizes: raw.sizes ?? current.sizes,
    tags: raw.tags ?? current.tags,
    featured: "featured" in raw ? raw.featured === true : current.featured,
    available: "available" in raw ? raw.available !== false : current.available,
  };

  const parsed = normalizeDraft(merged);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  if (!(await categoryExists(parsed.draft.categoryId))) {
    return { ok: false, error: "Categoria inexistente." };
  }

  const nameChanged = parsed.draft.name !== current.name;
  const slug = nameChanged
    ? await uniqueSlug(slugify(parsed.draft.name), current.id)
    : current.slug;

  const [updated] = await db
    .update(products)
    .set({
      categoryId: parsed.draft.categoryId,
      name: parsed.draft.name,
      slug,
      description: parsed.draft.description,
      imageUrl: parsed.draft.imageUrl,
      addonScope: parsed.draft.addonScope,
      sizes: parsed.draft.sizes,
      tags: parsed.draft.tags,
      featured: parsed.draft.featured,
      available: parsed.draft.available,
    })
    .where(eq(products.id, id))
    .returning();

  return { ok: true, product: updated };
}

export async function deleteProduct(id: number) {
  const [removed] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  if (!removed) return { ok: false as const, error: "Produto não encontrado." };
  return { ok: true as const, id: removed.id };
}


