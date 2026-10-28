import { asc } from "drizzle-orm";
import { db } from "@/db";
import { addons, categories, products } from "@/db/schema";
import { ensureDemoOrder, ensureSeed } from "@/db/seed";
import type { MenuPayload } from "@/lib/types";

let seeding: Promise<unknown> | null = null;

async function seedOnce() {
  if (!seeding) {
    seeding = (async () => {
      try {
        await ensureSeed();
        await ensureDemoOrder();
      } catch (error) {
        seeding = null;
        throw error;
      }
    })();
  }
  await seeding;
}

export async function getMenu(): Promise<MenuPayload> {
  await seedOnce();

  const [categoryRows, productRows, addonRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.position)),
    db.select().from(products).orderBy(asc(products.categoryId), asc(products.position)),
    db.select().from(addons).orderBy(asc(addons.scope), asc(addons.position)),
  ]);

  return {
    categories: categoryRows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      tagline: c.tagline,
      position: c.position,
    })),
    products: productRows.map((p) => ({
      id: p.id,
      categoryId: p.categoryId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
      addonScope: p.addonScope,
      sizes: p.sizes,
      tags: p.tags ?? [],
      featured: p.featured,
      available: p.available,
      position: p.position,
    })),
    addons: addonRows.map((a) => ({
      id: a.id,
      name: a.name,
      priceCents: a.priceCents,
      scope: a.scope,
      group: a.group,
    })),
  };
}
