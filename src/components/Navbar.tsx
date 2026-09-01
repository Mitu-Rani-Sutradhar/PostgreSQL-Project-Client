
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, User } from "@/services/users";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
    router.push("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/products"
            onClick={closeMenu}
            className="text-2xl font-extrabold tracking-tight text-blue-600"
          >
            ShopApp
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/products"
              className="font-medium text-gray-700 transition hover:text-blue-600"
            >
              Products
            </Link>

            {user && (
              <Link
                href="/orders"
                className="font-medium text-gray-700 transition hover:text-blue-600"
              >
                My Orders
              </Link>
            )}

            <Link
              href="/reviews"
              className="font-medium text-gray-700 transition hover:text-blue-600"
            >
              Reviews
            </Link>

            {/* Admin Navigation */}
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

            {/* Manager Navigation */}
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

            {/* User Info */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="max-w-[120px] truncate text-sm font-semibold text-gray-800">
                    {user.name}
                  </p>

                  <span
                    className={`inline-block text-xs font-semibold ${
                      user.role === "Admin"
                        ? "text-red-600"
                        : user.role === "Manager"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {user.role}
                  </span>
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

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link
                href="/products"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
              >
                Products
              </Link>

              {user && (
                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
                >
                  My Orders
                </Link>
              )}

              <Link
                href="/reviews"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
              >
                Reviews
              </Link>

              {/* Admin Mobile */}
              {user?.role === "Admin" && (
                <>
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
                  >
                    Admin Dashboard
                  </Link>

                  <Link
                    href="/admin/orders"
                    onClick={closeMenu}
                    className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
                  >
                    Manage Orders
                  </Link>
                </>
              )}

              {/* Manager Mobile */}
              {user?.role === "Manager" && (
                <>
                  <Link
                    href="/manager"
                    onClick={closeMenu}
                    className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
                  >
                    Manager Dashboard
                  </Link>

                  <Link
                    href="/admin/orders"
                    onClick={closeMenu}
                    className="rounded-lg px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
                  >
                    Manage Orders
                  </Link>
                </>
              )}

              {/* Mobile User Info */}
              {user ? (
                <div className="mt-2 border-t border-gray-200 pt-4">
                  <div className="mb-3 rounded-lg bg-gray-50 px-4 py-3">
                    <p className="font-semibold text-gray-800">
                      {user.name}
                    </p>

                    <p
                      className={`text-sm font-semibold ${
                        user.role === "Admin"
                          ? "text-red-600"
                          : user.role === "Manager"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {user.role}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="mt-2 rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

