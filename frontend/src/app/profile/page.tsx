import { requireAuth } from "@/lib/auth-utils";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <ProfileForm initialData={user} />
        </div>
      </div>
    </div>
  );
}
