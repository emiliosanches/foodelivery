import { requireAuth } from "@/lib/auth-utils";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
