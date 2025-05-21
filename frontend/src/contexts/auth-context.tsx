"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { logout as logoutAction } from "@/app/actions/auth";

// TODO replace with shared types
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  logout: () => Promise<void>;
  reloadUserInfo: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const loadUserFromCookie = () => {
    try {
      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user-info="));

      if (userCookie) {
        const userInfoStr = userCookie.split("=")[1];
        const userInfo = JSON.parse(decodeURIComponent(userInfoStr));
        setUser(userInfo);
      }
    } catch (error) {
      console.error("Failed to load user from cookie:", error);
    }
  };

  useEffect(() => {
    loadUserFromCookie();
  }, []);

  const logout = async () => {
    try {
      await logoutAction();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error on logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        reloadUserInfo: loadUserFromCookie,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
