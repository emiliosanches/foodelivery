import { requireRole } from "@/lib/auth-utils";

export default async function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["RESTAURANT"]);
  return <>{children}</>;
}
