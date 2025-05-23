"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { register } from "@/app/actions/auth";

const initialState = {
  success: false,
  error: undefined,
  values: {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CUSTOMER",
  },
};

type UserType = "CUSTOMER" | "RESTAURANT" | "DELIVERY";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>("CUSTOMER");
  const [state, formAction, pending] = useActionState(register, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="px-8 py-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-gray-600 mt-1">Join FooDelivery today</p>
      </div>

      {state.error?.general && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {state.error.general}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          You are:
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            className={`py-2 px-4 rounded-md border text-center transition-colors
              ${
                userType === "CUSTOMER"
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            onClick={() => setUserType("CUSTOMER")}
          >
            Customer
          </button>
          <button
            type="button"
            className={`py-2 px-4 rounded-md border text-center transition-colors
              ${
                userType === "RESTAURANT"
                  ? "border-restaurant bg-orange-50 text-orange-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            onClick={() => setUserType("RESTAURANT")}
          >
            Restaurant
          </button>
          <button
            type="button"
            className={`py-2 px-4 rounded-md border text-center transition-colors
              ${
                userType === "DELIVERY"
                  ? "border-delivery bg-green-50 text-green-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            onClick={() => setUserType("DELIVERY")}
          >
            Delivery
          </button>
        </div>
      </div>

      <form action={formAction} suppressHydrationWarning>
        <input type="hidden" name="role" value={userType} />

        <div className="space-y-4">
          <Input
            id="name"
            name="name"
            type="text"
            label="Full name"
            placeholder={
              userType === "RESTAURANT" ? "Restaurant name" : "Your full name"
            }
            defaultValue={state.values?.name}
            error={state.error?.name}
            required
            suppressHydrationWarning
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="your@email.com"
            defaultValue={state.values?.email}
            error={state.error?.email}
            required
            suppressHydrationWarning
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
              suppressHydrationWarning
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

          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Phone (optional)"
            placeholder="(00) 00000-0000"
            defaultValue={state.values?.phone}
            error={state.error?.phone}
            suppressHydrationWarning
          />

          <Button type="submit" className="w-full" isLoading={pending}>
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
