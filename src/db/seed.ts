import { db } from "@/db";
import { addons, categories, coupons, orderItems, orders, products } from "@/db/schema";
import type { ProductSize } from "@/db/schema";
import { sql } from "drizzle-orm";

const PIX = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`;

/** P / M / G padrão para as pizzas */
function pizzaSizes(p: number, m: number, g: number): ProductSize[] {
  return [
    { id: "p", label: "Pequena", detail: "25 cm · 4 fatias", priceCents: p },
    { id: "m", label: "Média", detail: "30 cm · 8 fatias", priceCents: m },
    { id: "g", label: "Grande", detail: "35 cm · 12 fatias", priceCents: g },
  ];
}

function doceSizes(p: number, m: number): ProductSize[] {
  return [
    { id: "p", label: "Individual", detail: "20 cm · 4 fatias", priceCents: p },
    { id: "m", label: "Compartilhar", detail: "30 cm · 8 fatias", priceCents: m },
  ];
}

function drinkSizes(price: number, label = "600 ml", detail = "Garrafa gelada"): ProductSize[] {
  return [{ id: "u", label, detail, priceCents: price }];
}

const CATEGORIES = [
  {
    slug: "tradicionais",
    name: "Pizzas Tradicionais",
    tagline: "Os clássicos napolitanos que nunca falham",
    position: 1,
  },
  {
    slug: "especiais",
    name: "Especiais da Casa",
    tagline: "Criações do nosso pizzaiolo, direto do forno a lenha",
    position: 2,
  },
  {
    slug: "doces",
    name: "Pizzas Doces",
    tagline: "Sobremesa que se come em fatia",
    position: 3,
  },
  {
    slug: "bebidas",
    name: "Bebidas",
    tagline: "Sempre estupidamente geladas",
    position: 4,
  },
];

type SeedProduct = {
  slug: string;
  category: string;
  name: string;
  description: string;
  image: string;
  addonScope: "salgada" | "doce" | null;
  sizes: ProductSize[];
  tags?: string[];
  featured?: boolean;
  available?: boolean;
  position: number;
};

const PRODUCTS: SeedProduct[] = [
  // ---------------- Tradicionais ----------------
  {
    slug: "margherita",
    category: "tradicionais",
    name: "Margherita D.O.P.",
    description:
      "Molho de tomate San Marzano, fior di latte, manjericão fresco e um fio de azeite extravirgem.",
    image: PIX("20115306"),
    addonScope: "salgada",
    sizes: pizzaSizes(4490, 5990, 7490),
    tags: ["vegetariana", "clássica"],
    featured: true,
    position: 1,
  },
  {
    slug: "calabresa-artesanal",
    category: "tradicionais",
    name: "Calabresa Artesanal",
    description:
      "Calabresa defumada fatiada na hora, cebola roxa, mussarela e orégano fresco.",
    image: PIX("20030839"),
    addonScope: "salgada",
    sizes: pizzaSizes(4290, 5790, 7290),
    tags: ["mais pedida"],
    featured: true,
    position: 2,
  },
  {
    slug: "portuguesa",
    category: "tradicionais",
    name: "Portuguesa da Nonna",
    description:
      "Presunto real, ovos caipiras, cebola, azeitonas pretas, ervilha fresca e mussarela.",
    image: PIX("9471604"),
    addonScope: "salgada",
    sizes: pizzaSizes(4690, 6190, 7690),
    tags: ["clássica"],
    position: 3,
  },
  {
    slug: "napolitana",
    category: "tradicionais",
    name: "Napolitana",
    description:
      "Tomate em rodelas, mussarela de búfala, parmesão, alho dourado e manjericão.",
    image: PIX("208537"),
    addonScope: "salgada",
    sizes: pizzaSizes(4590, 5990, 7490),
    tags: ["vegetariana"],
    position: 4,
  },
  {
    slug: "frango-catupiry",
    category: "tradicionais",
    name: "Frango com Catupiry",
    description:
      "Frango desfiado temperado, catupiry cremoso, milho e um toque de salsa.",
    image: PIX("10196831"),
    addonScope: "salgada",
    sizes: pizzaSizes(4790, 6290, 7790),
    tags: ["favorita da criançada"],
    position: 5,
  },
  {
    slug: "mussarela",
    category: "tradicionais",
    name: "Mussarela Simples",
    description: "Molho de tomate, mussarela em dobro, tomate cereja e orégano.",
    image: PIX("14538481"),
    addonScope: "salgada",
    sizes: pizzaSizes(3990, 5290, 6790),
    tags: ["vegetariana", "econômica"],
    position: 6,
  },

  // ---------------- Especiais ----------------
  {
    slug: "pepperoni-suprema",
    category: "especiais",
    name: "Pepperoni Suprema",
    description:
      "Pepperoni importado em dupla camada, mussarela maturada e mel apimentado à parte.",
    image: PIX("4109073"),
    addonScope: "salgada",
    sizes: pizzaSizes(5290, 6890, 8490),
    tags: ["campeã de vendas", "picante opcional"],
    featured: true,
    position: 1,
  },
  {
    slug: "parma-rucula",
    category: "especiais",
    name: "Parma & Rúcula",
    description:
      "Presunto de Parma curado 18 meses, rúcula selvagem, lascas de grana padano e redução de balsâmico.",
    image: PIX("16677736"),
    addonScope: "salgada",
    sizes: pizzaSizes(5990, 7590, 9190),
    tags: ["premium", "chef"],
    featured: true,
    position: 2,
  },
  {
    slug: "quatro-queijos",
    category: "especiais",
    name: "Quatro Queijos do Forno",
    description: "Mussarela, gorgonzola, grana padano e provolone, finalizados com nozes.",
    image: PIX("19260836"),
    addonScope: "salgada",
    sizes: pizzaSizes(5490, 7090, 8690),
    tags: ["vegetariana", "premium"],
    position: 3,
  },
  {
    slug: "vegetariana-do-celeiro",
    category: "especiais",
    name: "Vegetariana do Celeiro",
    description:
      "Abobrinha grelhada, berinjela, pimentões coloridos, cogumelos, tomate confit e pesto de manjericão.",
    image: PIX("33593000"),
    addonScope: "salgada",
    sizes: pizzaSizes(4990, 6490, 7990),
    tags: ["vegetariana", "vegana opcional"],
    position: 4,
  },
  {
    slug: "bacon-bbq",
    category: "especiais",
    name: "Bacon BBQ Defumado",
    description:
      "Bacon artesanal, cebola caramelizada na cerveja preta, molho barbecue da casa e cheddar inglês.",
    image: PIX("17402718"),
    addonScope: "salgada",
    sizes: pizzaSizes(5590, 7190, 8790),
    tags: ["defumada", "novidade"],
    position: 5,
  },
  {
    slug: "toscana-piccante",
    category: "especiais",
    name: "Toscana Piccante",
    description:
      "Linguiça toscana artesanal, pimenta calabresa, mussarela defumada e pimentões assados.",
    image: PIX("19786207"),
    addonScope: "salgada",
    sizes: pizzaSizes(5390, 6990, 8590),
    tags: ["picante"],
    available: true,
    position: 6,
  },

  // ---------------- Doces ----------------
  {
    slug: "chocolate-morango",
    category: "doces",
    name: "Chocolate Belga com Morango",
    description:
      "Chocolate belga 54% derretido, morangos frescos fatiados e raspas de chocolate branco.",
    image: PIX("17637080"),
    addonScope: "doce",
    sizes: doceSizes(3990, 5490),
    tags: ["mais pedida"],
    featured: true,
    position: 1,
  },
  {
    slug: "banana-doce-de-leite",
    category: "doces",
    name: "Banana com Doce de Leite",
    description: "Banana caramelizada na manteiga, doce de leite argentino e canela em pó.",
    image: PIX("17637073"),
    addonScope: "doce",
    sizes: doceSizes(3690, 4990),
    tags: ["clássica"],
    position: 2,
  },
  {
    slug: "prestigio",
    category: "doces",
    name: "Prestígio Cremoso",
    description: "Creme de coco artesanal, cobertura de chocolate ao leite e coco queimado.",
    image: PIX("33457636"),
    addonScope: "doce",
    sizes: doceSizes(3890, 5290),
    tags: [],
    position: 3,
  },
  {
    slug: "frutas-vermelhas",
    category: "doces",
    name: "Frutas Vermelhas & Cream Cheese",
    description: "Cream cheese batido com limão siciliano, calda de frutas vermelhas e hortelã.",
    image: PIX("33457632"),
    addonScope: "doce",
    sizes: doceSizes(4190, 5690),
    tags: ["chef"],
    position: 4,
  },

  // ---------------- Bebidas ----------------
  {
    slug: "coca-cola-2l",
    category: "bebidas",
    name: "Coca-Cola Original",
    description: "A dupla inseparável da pizza. Servida a 4 °C.",
    image: PIX("844875"),
    addonScope: null,
    sizes: [
      { id: "u", label: "2 litros", detail: "Garrafa PET", priceCents: 1490 },
    ],
    tags: ["gelada"],
    position: 1,
  },
  {
    slug: "guarana-antarctica",
    category: "bebidas",
    name: "Guaraná Antarctica",
    description: "Refrigerante de guaraná em garrafa de vidro retornável.",
    image: PIX("4113622"),
    addonScope: null,
    sizes: drinkSizes(1290, "1 litro", "Garrafa de vidro"),
    position: 2,
  },
  {
    slug: "suco-uva-integral",
    category: "bebidas",
    name: "Suco de Uva Integral",
    description: "Uva tinta da Serra Gaúcha, sem açúcar e sem conservantes.",
    image: PIX("4113633"),
    addonScope: null,
    sizes: drinkSizes(1690, "900 ml", "Garrafa de vidro"),
    tags: ["sem álcool"],
    position: 3,
  },
  {
    slug: "kombucha-artesanal",
    category: "bebidas",
    name: "Kombucha Artesanal",
    description: "Fermentada na casa, sabor gengibre e limão siciliano.",
    image: PIX("27798034"),
    addonScope: null,
    sizes: drinkSizes(1590, "500 ml", "Garrafa long neck"),
    tags: ["artesanal"],
    available: true,
    position: 4,
  },
];

const ADDONS = [
  { name: "Mussarela extra", priceCents: 700, scope: "salgada", group: "Queijos", position: 1 },
  { name: "Catupiry original", priceCents: 800, scope: "salgada", group: "Queijos", position: 2 },
  { name: "Gorgonzola", priceCents: 900, scope: "salgada", group: "Queijos", position: 3 },
  { name: "Borda recheada de catupiry", priceCents: 1200, scope: "salgada", group: "Bordas", position: 4 },
  { name: "Borda de cheddar", priceCents: 1200, scope: "salgada", group: "Bordas", position: 5 },
  { name: "Pepperoni extra", priceCents: 900, scope: "salgada", group: "Proteínas", position: 6 },
  { name: "Bacon artesanal", priceCents: 850, scope: "salgada", group: "Proteínas", position: 7 },
  { name: "Frango desfiado", priceCents: 800, scope: "salgada", group: "Proteínas", position: 8 },
  { name: "Presunto de Parma", priceCents: 1400, scope: "salgada", group: "Proteínas", position: 9 },
  { name: "Rúcula selvagem", priceCents: 500, scope: "salgada", group: "Frescos", position: 10 },
  { name: "Tomate cereja confit", priceCents: 550, scope: "salgada", group: "Frescos", position: 11 },
  { name: "Cogumelos salteados", priceCents: 750, scope: "salgada", group: "Frescos", position: 12 },
  { name: "Azeitonas pretas", priceCents: 400, scope: "salgada", group: "Frescos", position: 13 },
  { name: "Cebola caramelizada", priceCents: 550, scope: "salgada", group: "Frescos", position: 14 },
  { name: "Borda de chocolate", priceCents: 1000, scope: "doce", group: "Bordas", position: 1 },
  { name: "Leite condensado", priceCents: 600, scope: "doce", group: "Coberturas", position: 2 },
  { name: "Chocolate belga extra", priceCents: 900, scope: "doce", group: "Coberturas", position: 3 },
  { name: "Morangos frescos", priceCents: 800, scope: "doce", group: "Coberturas", position: 4 },
  { name: "Doce de leite argentino", priceCents: 700, scope: "doce", group: "Coberturas", position: 5 },
  { name: "Bola de sorvete de creme", priceCents: 1200, scope: "doce", group: "Acompanha", position: 6 },
];

const COUPONS = [
  {
    code: "PRIMEIRAFATIA",
    kind: "percent",
    value: 10,
    description: "10% de desconto no primeiro pedido",
    minSubtotalCents: 0,
  },
  {
    code: "FRETEGRATIS",
    kind: "free_delivery",
    value: 0,
    description: "Taxa de entrega por nossa conta",
    minSubtotalCents: 5000,
  },
  {
    code: "RODADA20",
    kind: "amount",
    value: 2000,
    description: "R$ 20 off pedindo acima de R$ 100",
    minSubtotalCents: 10000,
  },
];

/**
 * Garante que o cardápio exista no banco. Idempotente: roda em toda inicialização
 * e só insere quando as tabelas estão vazias.
 */
export async function ensureSeed() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categories);

  if (count > 0) return false;

  const categoryIdBySlug = new Map<string, number>();
  for (const category of CATEGORIES) {
    const [inserted] = await db.insert(categories).values(category).returning({ id: categories.id });
    categoryIdBySlug.set(category.slug, inserted.id);
  }

  await db.insert(addons).values(ADDONS);
  await db.insert(coupons).values(COUPONS);

  await db.insert(products).values(
    PRODUCTS.map((product) => ({
      categoryId: categoryIdBySlug.get(product.category)!,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.image,
      addonScope: product.addonScope,
      sizes: product.sizes,
      tags: product.tags ?? [],
      featured: product.featured ?? false,
      available: product.available ?? true,
      position: product.position,
    })),
  );

  return true;
}

/** Pedido de demonstração para o painel administrativo não nascer vazio. */
export async function ensureDemoOrder() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  if (count > 0) return false;

  const rows = await db
    .select({ id: products.id, name: products.name, imageUrl: products.imageUrl, sizes: products.sizes })
    .from(products)
    .limit(4);

  const margherita = rows.find((r) => r.name.includes("Margherita")) ?? rows[0];
  const pepperoni = rows.find((r) => r.name.includes("Pepperoni")) ?? rows[1] ?? rows[0];
  const cola = rows.find((r) => r.name.includes("Coca")) ?? rows[rows.length - 1];
  if (!margherita || !pepperoni || !cola) return false;

  const items = [
    { product: margherita, sizeId: "g", qty: 1, addonNames: ["Borda recheada de catupiry"] },
    { product: pepperoni, sizeId: "m", qty: 1, addonNames: ["Pepperoni extra"] },
    { product: cola, sizeId: "u", qty: 2, addonNames: [] },
  ];

  const addonRows = await db.select().from(addons);
  let subtotal = 0;
  const itemValues = items.map((item) => {
    const size = item.product.sizes.find((s) => s.id === item.sizeId) ?? item.product.sizes[0];
    const selected = addonRows
      .filter((a) => item.addonNames.includes(a.name))
      .map((a) => ({ id: a.id, name: a.name, priceCents: a.priceCents }));
    const unit = size.priceCents + selected.reduce((sum, a) => sum + a.priceCents, 0);
    subtotal += unit * item.qty;
    return {
      productId: item.product.id,
      productName: item.product.name,
      imageUrl: item.product.imageUrl,
      sizeId: size.id,
      sizeLabel: size.label,
      unitPriceCents: unit,
      quantity: item.qty,
      selectedAddons: selected,
      notes: null,
      totalCents: unit * item.qty,
    };
  });

  const deliveryFee = 890;
  const [order] = await db
    .insert(orders)
    .values({
      code: "FD-1001",
      customerName: "Giulia Ferrari",
      phone: "(11) 98812-4477",
      fulfillment: "delivery",
      street: "Rua Harmonia",
      houseNumber: "233",
      complement: "Apto 82",
      district: "Vila Madalena",
      reference: "Portão verde, interfone 82",
      paymentMethod: "pix",
      couponCode: null,
      notes: "Tocar o interfone duas vezes.",
      subtotalCents: subtotal,
      discountCents: 0,
      deliveryFeeCents: deliveryFee,
      totalCents: subtotal + deliveryFee,
      status: "oven",
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values(itemValues.map((v) => ({ ...v, orderId: order.id })));

  return true;
}
