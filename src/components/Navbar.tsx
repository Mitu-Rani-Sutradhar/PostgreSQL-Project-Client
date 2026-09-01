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
        {/* Logo */}
        <Link
          href="/products"
          className="text-2xl font-bold text-blue-600"
        >
          ShopApp
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          {/* Products */}
          <Link
            href="/products"
            className="font-medium text-gray-700 transition hover:text-blue-600"
          >
            Products
          </Link>

          {/* My Orders */}
          {user && (
            <Link
              href="/orders"
              className="font-medium text-gray-700 transition hover:text-blue-600"
            >
              My Orders
            </Link>
          )}

          {/* Reviews */}
          <Link
            href="/reviews"
            className="font-medium text-gray-700 transition hover:text-blue-600"
          >
            Reviews
          </Link>

          {/* Admin */}
          {user?.role === "Admin" && (
            <>
              <Link
                href="/admin"
                className="font-medium text-gray-700 transition hover:text-blue-600"
              >
                Admin
              </Link>

              <Link
                href="/admin/orders"
                className="font-medium text-gray-700 transition hover:text-blue-600"
              >
                Manage Orders
              </Link>
            </>
          )}

          {/* Manager */}
          {user?.role === "Manager" && (
            <>
              <Link
                href="/manager"
                className="font-medium text-gray-700 transition hover:text-blue-600"
              >
                Manager
              </Link>

              <Link
                href="/admin/orders"
                className="font-medium text-gray-700 transition hover:text-blue-600"
              >
                Manage Orders
              </Link>
            </>
          )}

          {/* User / Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.role}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}