"use client";

import { useEffect, useState } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  Order,
  OrderStatus,
} from "@/services/orders";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
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

      if (user.role !== "Admin" && user.role !== "Manager") {
        router.push("/products");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error: any) {
        console.error("All orders error:", error);

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

  const handleStatusChange = async (
    orderId: string,
    status: OrderStatus
  ) => {
    try {
      const updatedOrder = await updateOrderStatus(
        orderId,
        status
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order
        )
      );

      alert("Order status updated successfully!");
    } catch (error: any) {
      console.error("Status update error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to update order status"
      );
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading orders...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-red-100 p-4 text-red-600">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            All Orders
          </h1>

          <p className="mt-2 text-gray-500">
            Manage customer orders and update their status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              No orders found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full min-w-[900px]">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {order.user?.name || "Unknown"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {order.user?.email || ""}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {order.product?.title || "Product"}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {order.quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target.value as OrderStatus
                          )
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Confirmed">
                          Confirmed
                        </option>

                        <option value="Shipped">
                          Shipped
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}