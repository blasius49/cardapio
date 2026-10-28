import type { Metadata } from "next";
import { AdminBoard } from "@/components/admin-board";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel da pizzaria · Forno d'Oro",
};

export default function AdminPage() {
  return <AdminBoard />;
}
