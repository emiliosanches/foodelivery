"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { User } from "@/contexts/auth-context";

const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

const loginSchema = z.object({
  email: z.string().email("Email is not valid"),
  password: z.string().min(1, "Password is required"),
});

export type LoginResult = {
  success: boolean;
  error?: {
    general?: string;
    email?: string;
    password?: string;
  };
  values?: {
    email: string;
    password: string;
  };
};

export async function login(
  _: unknown,
  formData: FormData
): Promise<LoginResult> {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(rawFormData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;

    return {
      success: false,
      error: {
        email: errors.email?.join("; "),
        password: errors.password?.join("; "),
      },
      values: { ...rawFormData, password: "" },
    };
  }

  try {
    const { email, password } = validation.data;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email !== "test@example.com" || password !== "password123") {
      return {
        success: false,
        error: { general: "Invalid credentials. Please try again." },
        values: { email, password: "" },
      };
    }

    const authResponse = {
      token: "jwt-token-simulated",
      user: {
        id: "user-123",
        name: "Test User",
        email,
        role: "CUSTOMER",
      },
    };

    const cookiesStore = await cookies();
    cookiesStore.set({
      name: "auth-token",
      value: authResponse.token,
      httpOnly: true,
      path: "/",
      maxAge: TOKEN_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    cookiesStore.set({
      name: "user-info",
      value: JSON.stringify({
        id: authResponse.user.id,
        name: authResponse.user.name,
        email: authResponse.user.email,
        role: authResponse.user.role,
      }),
      httpOnly: false,
      path: "/",
      maxAge: TOKEN_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return {
      success: true,
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: { general: "Failed to login. Please try again." },
      values: { ...rawFormData, password: "" },
    };
  }
}

const registerSchema = z.object({
  name: z.string().min(3, "Name must have at least 3 characters"),
  email: z.string().email("Email is not valid"),
  password: z.string().min(6, "Password must have at least 6 characters"),
  phone: z
    .string()
    .regex(/^\d{9,}$/, "Phone must be a phone with at least 9 digits")
    .optional(),
  role: z.enum(["CUSTOMER", "RESTAURANT", "DELIVERY"]),
});

export type RegisterResult = {
  success: boolean;
  error?: {
    general?: string;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  };
  values?: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
  };
  redirectTo?: string;
};

export async function register(
  _: unknown,
  formData: FormData
): Promise<RegisterResult> {
  const rawFormData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: (formData.get("phone") as string) || undefined,
    role: formData.get("role") as "CUSTOMER" | "RESTAURANT" | "DELIVERY",
  };

  const validation = registerSchema.safeParse(rawFormData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;

    return {
      success: false,
      error: {
        name: errors.name?.join("; "),
        email: errors.email?.join("; "),
        password: errors.password?.join("; "),
        phone: errors.phone?.join("; "),
      },
      values: { ...rawFormData, password: "" },
    };
  }

  try {
    const data = validation.data;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (data.email === "test@example.com") {
      return {
        success: false,
        error: { email: "This email is already in use" },
        values: { ...data, password: "" },
      };
    }

    return {
      success: true,
      redirectTo: `/auth/register-success?type=${data.role.toLowerCase()}`,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: { general: "Failed to create account. Please try again." },
      values: { ...rawFormData, password: "" },
    };
  }
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    const cookiesStore = await cookies();
    cookiesStore.delete("auth-token");
    cookiesStore.delete("user-info");

    return { success: true };
  } catch (error) {
    console.error("Error on logout:", error);
    return { success: false };
  }
}

export async function getAuthenticatedUser(): Promise<{
  isAuthenticated: boolean;
  user?: User;
}> {
  const cookiesStore = await cookies();

  const token = cookiesStore.get("auth-token")?.value;
  const userInfo = cookiesStore.get("user-info")?.value;

  if (!token || !userInfo) {
    return { isAuthenticated: false };
  }

  try {
    const userData = JSON.parse(userInfo);
    return {
      isAuthenticated: true,
      user: userData,
    };
  } catch {
    return { isAuthenticated: false };
  }
}
