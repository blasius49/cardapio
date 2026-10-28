import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks, ServiceInfo } from "@/components/how-it-works";
import { MenuExperience } from "@/components/menu-experience";
import { OrderLookup } from "@/components/order-lookup";
import { computeOpenNow } from "@/lib/hours";
import { getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const menu = await getMenu();
  const featured = menu.products.filter((product) => product.featured);
  const openNow = computeOpenNow();

  return (
    <>
      <Header openNow={openNow} />
      <main>
        <Hero featured={featured.length > 0 ? featured : menu.products.slice(0, 2)} />
        <MenuExperience menu={menu} />
        <HowItWorks />
        <ServiceInfo />
        <OrderLookup />
      </main>
      <Footer />
    </>
  );
}
