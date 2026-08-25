"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, User } from "@/services/users";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/products"
          className="text-2xl font-bold text-blue-600"
        >
          ShopApp
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-gray-700 hover:text-blue-600"
          >
            Products
          </Link>

          {user && (
            <Link
              href="/orders"
              className="text-gray-700 hover:text-blue-600"
            >
              My Orders
            </Link>
          )}

          {user?.role === "Admin" && (
            <Link
              href="/admin"
              className="text-gray-700 hover:text-blue-600"
            >
              Admin
            </Link>
          )}

          {user?.role === "Manager" && (
            <Link
              href="/manager"
              className="text-gray-700 hover:text-blue-600"
            >
              Manager
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.role}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}