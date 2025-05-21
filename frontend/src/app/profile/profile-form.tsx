"use client";

import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { updateProfile } from "@/app/actions/profile";
import { useActionState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
};

export default function ProfileForm({ initialData }: { initialData: User }) {
  const initialState = {
    success: false,
    error: undefined,
    values: {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone || "",
    },
  };

  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );

  const { reloadUserInfo } = useAuth();

  useEffect(() => {
    if (state.success) reloadUserInfo();
  }, [state.success, reloadUserInfo]);

  return (
    <form action={formAction}>
      {state.success && (
        <div className="p-4 mb-6 rounded-md bg-green-50 text-green-700">
          Profile updated successfully!
        </div>
      )}

      {state.error?.general && (
        <div className="p-4 mb-6 rounded-md bg-red-50 text-red-700">
          {state.error.general}
        </div>
      )}

      <div className="space-y-4">
        <Input
          id="name"
          name="name"
          label="Name"
          defaultValue={state.values?.name}
          error={state.error?.name}
          required
        />

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          defaultValue={state.values?.email}
          error={state.error?.email}
          required
        />

        <Input
          id="phone"
          name="phone"
          label="Phone number (opcional)"
          defaultValue={state.values?.phone}
          error={state.error?.phone}
        />

        <div className="pt-4">
          <Button type="submit" isLoading={pending}>
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
