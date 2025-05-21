"use server";

import { cookies } from "next/headers";
import z from "zod";
import { api } from "@/lib/service/api";
import { ApiError } from "@/lib/service/api-error";

export type ProfileData = {
  name: string;
  email: string;
  phone?: string;
};

const updateProfileSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(3, "Name must have at least 3 characters"),
  email: z
    .string({ message: "Email is required" })
    .email("Email is not a valid email address"),
  phone: z
    .string()
    .regex(/^\+?\d{9,}$/, "Phone must be a phone with at least 9 digits (ex: +123499999)")
    .optional(),
});

export type UpdateProfileResult = {
  success: boolean;
  error?: {
    general?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  values?: {
    name: string;
    email: string;
    phone: string | undefined;
  };
};

export async function updateProfile(
  _: unknown,
  data: FormData
): Promise<UpdateProfileResult> {
  const formValues = {
    name: data.get("name") as string,
    email: data.get("email") as string,
    phone: (data.get("phone") as string) || undefined,
  };

  try {
    const validation = updateProfileSchema.safeParse(formValues);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;

      return {
        success: false,
        error: {
          name: errors.name?.join("; "),
          email: errors.email?.join("; "),
          phone: errors.phone?.join("; "),
        },
        values: formValues,
      };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: { general: "Authentication token not found" },
        values: formValues,
      };
    }

    try {
      const updatedUserData = await api<{
        name: string;
        email: string;
        phone?: string;
      }>("/users/me", {
        method: "PATCH",
        body: validation.data,
        cache: "no-store",
      });

      const updatedUser = {
        name: updatedUserData.name || validation.data.name,
        email: updatedUserData.email || validation.data.email,
        phone: updatedUserData.phone || validation.data.phone,
      };

      cookieStore.set({
        name: "user-info",
        value: JSON.stringify(updatedUser),
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return {
        success: true,
        values: {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
        },
      };
    } catch (error) {
      console.error("Failed to update profile:", error);

      if (error instanceof ApiError && error.statusCode === 409) {
        return {
          success: false,
          error: { email: "This email is already in use by another account" },
          values: formValues,
        };
      }

      return {
        success: false,
        error: {
          general:
            error instanceof Error
              ? error.message
              : "Failed to update profile. Try again.",
        },
        values: formValues,
      };
    }
  } catch (error) {
    console.error("Failed to update profile:", error);
    return {
      success: false,
      error: { general: "Failed to update profile. Try again." },
      values: formValues,
    };
  }
}
