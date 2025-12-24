import { requireRole } from "@/lib/auth-utils";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["DELIVERY"]);
  return <>{children}</>;
}
