"use server";

import { cookies as getCookies } from "next/headers";
import { getServerUser } from "@/lib/auth-utils";
import z from "zod";

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
    .regex(
      /^\d{9,}$/,
      "Phone must be a phone starting with DDI (ex: +12321232123)"
    )
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
    const currentUser = await getServerUser();

    if (!currentUser) {
      return {
        success: false,
        error: { general: "You must be authenticated to update your profile" },
        values: formValues,
      };
    }

    const { success, error, data } = updateProfileSchema.safeParse(formValues);

    if (!success) {
      const errors = error.flatten().fieldErrors;

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

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser = {
      ...currentUser,
      name: data.name,
      email: data.email,
    };

    const cookies = await getCookies();

    cookies.set({
      name: "user-info",
      value: JSON.stringify(updatedUser),
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return { success: true, values: formValues };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return {
      success: false,
      error: { general: "Failed to update profile. Try again." },
      values: formValues,
    };
  }
}
