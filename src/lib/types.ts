import type { AddonChoice, ProductSize } from "@/db/schema";

export type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  position: number;
};

export type MenuProduct = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  addonScope: string | null;
  sizes: ProductSize[];
  tags: string[];
  featured: boolean;
  available: boolean;
  position: number;
};

export type MenuAddon = {
  id: number;
  name: string;
  priceCents: number;
  scope: string;
  group: string;
};

export type MenuPayload = {
  categories: MenuCategory[];
  products: MenuProduct[];
  addons: MenuAddon[];
};

export type CartItem = {
  key: string;
  productId: number;
  name: string;
  imageUrl: string | null;
  sizeId: string;
  sizeLabel: string;
  unitPriceCents: number;
  quantity: number;
  addons: AddonChoice[];
  notes: string;
};

export type OrderItemRow = {
  id: number;
  productId: number | null;
  productName: string;
  imageUrl: string | null;
  sizeId: string;
  sizeLabel: string;
  unitPriceCents: number;
  quantity: number;
  selectedAddons: AddonChoice[];
  notes: string | null;
  totalCents: number;
};

export function makeCartItemKey(
  productId: number,
  sizeId: string,
  addonIds: number[],
  notes: string,
) {
  return [productId, sizeId, [...addonIds].sort((a, b) => a - b).join("-"), notes.trim()].join("|");
}
