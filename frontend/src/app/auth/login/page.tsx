"use client";

import { useState, useEffect, useActionState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { login } from "@/app/actions/auth";
import { useAuth } from "@/contexts/auth-context";

const initialState = {
  success: false,
  error: undefined,
  values: { email: "", password: "" },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(login, initialState);
  const { reloadUserInfo } = useAuth();

  useEffect(() => {
    if (state.success) {
      reloadUserInfo();
      redirect('/')
    }
  }, [state.success, reloadUserInfo]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-grow justify-center items-center px-16 py-8 h-full">
      <div className="p-8 shadow rounded-xl bg-background-secondary">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-gray-600 mt-1">Access your mini-food account</p>
        </div>

        {state.error?.general && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {state.error.general}
          </div>
        )}

        <form action={formAction}>
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="your@email.com"
              defaultValue={state.values?.email}
              error={state.error?.email}
              required
            />

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                defaultValue={state.values?.password}
                error={state.error?.password}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-[34px] text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={pending}>
              Login
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&lsquo;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
