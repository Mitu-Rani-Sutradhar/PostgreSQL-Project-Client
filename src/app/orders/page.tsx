"use client";

import { useEffect, useState } from "react";
import { getMyOrders, Order } from "@/services/orders";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error: any) {
        console.error("Orders error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-red-100 p-4 text-red-600">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Orders
          </h1>

          <p className="mt-2 text-gray-500">
            View your order history and current status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-700">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your orders will appear here after you place an order.
            </p>

            <button
              onClick={() => router.push("/products")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {order.product?.title || "Product"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Order ID: {order.id}
                    </p>

                    <p className="mt-3 text-gray-700">
                      Quantity:{" "}
                      <span className="font-semibold">
                        {order.quantity}
                      </span>
                    </p>

                    {order.product && (
                      <p className="mt-1 text-gray-700">
                        Price:{" "}
                        <span className="font-semibold">
                          ৳{order.product.price}
                        </span>
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "Shipped"
                        ? "bg-purple-100 text-purple-700"
                        : order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-5 border-t pt-4 text-sm text-gray-500">
                  Ordered:{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}