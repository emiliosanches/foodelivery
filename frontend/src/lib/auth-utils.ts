'use server'

import { cookies as getCookies } from "next/headers";
import { redirect } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function getUserServerSide(): Promise<User | null> {
  const cookies = await getCookies();
  const userCookie = cookies.get("user-info");
  const tokenCookie = cookies.get("auth-token");

  if (!userCookie || !tokenCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value) as User;
  } catch {
    return null;
  }
}

export async function requireAuth(redirectUrl = "/auth/login"): Promise<User> {
  const user = await getUserServerSide();

  if (!user) {
    redirect(redirectUrl);
  }

  return user;
}

export async function requireRole(
  allowedRoles: string[],
  redirectUrl = "/"
): Promise<User> {
  const user = await requireAuth("/auth/login");

  if (!allowedRoles.includes(user.role)) {
    redirect(redirectUrl);
  }

  return user;
}
