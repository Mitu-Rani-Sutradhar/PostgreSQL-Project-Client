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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading dashboard...
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

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage products, orders, and reviews.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {orders.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Reviews
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {reviews.length}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            href="/products"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-gray-800">
              Products
            </h2>

            <p className="mt-2 text-gray-500">
              Create, update, and delete products.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-gray-800">
              Manage Orders
            </h2>

            <p className="mt-2 text-gray-500">
              View all orders and update status.
            </p>
          </Link>

          <Link
            href="/reviews"
            className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold text-gray-800">
              Reviews
            </h2>

            <p className="mt-2 text-gray-500">
              View customer reviews.
            </p>
          </Link>
        </div>

        {/* Order Summary */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-800">
            Order Summary
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-800">
                {pendingOrders}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">
                Delivered
              </p>

              <p className="mt-1 text-2xl font-bold text-green-800">
                {deliveredOrders}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}