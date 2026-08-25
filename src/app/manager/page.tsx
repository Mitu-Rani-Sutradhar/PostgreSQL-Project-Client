"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getProducts, Product } from "@/services/products";

export default function ManagerDashboard() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "Manager") {
        router.push("/products");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error: any) {
        console.error("Manager dashboard error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading Manager Dashboard...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Manager Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage products and update order status.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Active Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Role
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              Manager
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            href="/products"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-gray-800">
              Manage Products
            </h2>

            <p className="mt-2 text-gray-500">
              Create, edit, and delete products.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-gray-800">
              Update Order Status
            </h2>

            <p className="mt-2 text-gray-500">
              Use the order management page to update
              order status.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}