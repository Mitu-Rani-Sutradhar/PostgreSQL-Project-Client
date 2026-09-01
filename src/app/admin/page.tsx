
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getProducts, Product } from "@/services/products";
import { getAllOrders, Order } from "@/services/orders";
import { getReviews, Review } from "@/services/reviews";

export default function AdminDashboard() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

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

      if (user.role !== "Admin") {
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

        const [productsData, ordersData, reviewsData] =
          await Promise.all([
            getProducts(),
            getAllOrders(),
            getReviews(),
          ]);

        setProducts(productsData);
        setOrders(ordersData);
        setReviews(reviewsData);
      } catch (error: any) {
        console.error("Dashboard error:", error);

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

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "Confirmed"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  ).length;

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Confirmed":
        return "bg-blue-100 text-blue-700";

      case "Shipped":
        return "bg-purple-100 text-purple-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="rounded-2xl bg-white px-10 py-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-lg font-medium text-gray-600">
            Loading Admin Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-700">
              Dashboard Error
            </h2>

            <p className="mt-2 text-red-600">{error}</p>

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage products, orders, inventory, and reviews.
            </p>
          </div>

          <span className="w-fit rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            Administrator
          </span>
        </div>

        {/* Main Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {products.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Active products
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {orders.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Customer orders
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingOrders}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Need attention
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Reviews
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {reviews.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Customer reviews
            </p>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Stock
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalStock}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Units available
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {lowStockProducts}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              5 or fewer units
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {outOfStockProducts}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Products unavailable
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
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
                    Products
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Create, update, and delete products.
                  </p>
                </div>

                <span className="text-xl text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

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
                    Orders
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    View orders and update their status.
                  </p>
                </div>

                <span className="text-xl text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/reviews"
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-2xl">
                    ⭐
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-gray-800">
                    Reviews
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    View customer product reviews.
                  </p>
                </div>

                <span className="text-xl text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Order Status */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              Order Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current order distribution.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-800">
                {pendingOrders}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                Confirmed
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-800">
                {confirmedOrders}
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-sm text-purple-700">
                Shipped
              </p>

              <p className="mt-1 text-2xl font-bold text-purple-800">
                {shippedOrders}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-green-700">
                Delivered
              </p>

              <p className="mt-1 text-2xl font-bold text-green-800">
                {deliveredOrders}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Cancelled
              </p>

              <p className="mt-1 text-2xl font-bold text-red-800">
                {cancelledOrders}
              </p>
            </div>
          </div>
        </section>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest customer orders.
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="w-fit rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr
                      key={order.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500">
                          {order.id.slice(0, 8)}...
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {order.user?.name || "Unknown"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {order.user?.email || ""}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-700">
                          {order.product?.title || "Product"}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-800">
                        ৳
                        {(order.product?.price || 0) *
                          order.quantity}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Inventory Alert */}
        {(lowStockProducts > 0 || outOfStockProducts > 0) && (
          <section className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
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
              className="mt-4 inline-flex rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700"
            >
              Manage Inventory
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}