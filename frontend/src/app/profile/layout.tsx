import { requireAuth } from "@/lib/auth-utils";
import ProfileNav from "./nav";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <ProfileNav />
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
