
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
        setLoading(true);
        setError("");

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

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="rounded-xl bg-white px-8 py-6 text-center shadow">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-lg font-medium text-gray-600">
            Loading Manager Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-semibold text-red-700">
              Dashboard Error
            </h2>

            <p className="mt-1 text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Manager Dashboard
              </h1>

              <p className="mt-2 text-gray-500">
                Manage products and monitor inventory.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Manager
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {totalProducts}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Available in catalog
            </p>
          </div>

          {/* Total Stock */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalStock}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Units available
            </p>
          </div>

          {/* Low Stock */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {lowStockProducts}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              5 or fewer units
            </p>
          </div>

          {/* Out of Stock */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockProducts}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Products unavailable
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Products */}
            <Link
              href="/products"
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                    📦
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-gray-800">
                    Manage Products
                  </h3>

                  <p className="mt-2 text-gray-500">
                    Create, edit, update stock, and delete
                    products.
                  </p>
                </div>

                <span className="text-xl text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            {/* Orders */}
            <Link
              href="/admin/orders"
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                    🛒
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-gray-800">
                    Manage Orders
                  </h3>

                  <p className="mt-2 text-gray-500">
                    View customer orders and update their
                    status.
                  </p>
                </div>

                <span className="text-xl text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Inventory Alert */}
        {(lowStockProducts > 0 || outOfStockProducts > 0) && (
          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="text-lg font-bold text-yellow-800">
              Inventory Alert
            </h2>

            <p className="mt-2 text-sm text-yellow-700">
              {outOfStockProducts > 0 &&
                `${outOfStockProducts} product${
                  outOfStockProducts > 1 ? "s are" : " is"
                } out of stock. `}

              {lowStockProducts > 0 &&
                `${lowStockProducts} product${
                  lowStockProducts > 1 ? "s have" : " has"
                } low stock.`}
            </p>

            <Link
              href="/products"
              className="mt-4 inline-flex rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
            >
              Check Inventory
            </Link>
          </div>
        )}

        {/* Recent Product Inventory */}
        {products.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-xl font-bold text-gray-800">
                Product Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current stock overview.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.slice(0, 10).map((product) => {
                    const isOutOfStock = product.stock === 0;
                    const isLowStock =
                      product.stock > 0 && product.stock <= 5;

                    return (
                      <tr
                        key={product.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {product.title}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-700">
                          ৳{product.price}
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-700">
                          {product.stock}
                        </td>

                        <td className="px-6 py-4">
                          {isOutOfStock ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

