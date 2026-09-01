
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
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null
  );

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
          error?.response?.data?.message || "Failed to load orders"
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
      setUpdatingOrderId(orderId);

      const updatedOrder = await updateOrderStatus(orderId, status);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    } catch (error: any) {
      console.error("Status update error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusOptions = (status: OrderStatus): OrderStatus[] => {
    switch (status) {
      case "Pending":
        return ["Pending", "Confirmed", "Cancelled"];

      case "Confirmed":
        return ["Confirmed", "Shipped", "Cancelled"];

      case "Shipped":
        return ["Shipped", "Delivered"];

      case "Delivered":
        return ["Delivered"];

      case "Cancelled":
        return ["Cancelled"];

      default:
        return [status];
    }
  };

  const getStatusClass = (status: OrderStatus) => {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalPrice = (order: Order) => {
    return (order.product?.price || 0) * order.quantity;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white px-8 py-6 shadow">
          <p className="text-lg font-medium text-gray-600">
            Loading orders...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-red-100 p-5 text-red-600">
            {error}
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
          <h1 className="text-3xl font-bold text-gray-800">
            All Orders
          </h1>

          <p className="mt-2 text-gray-500">
            Manage customer orders and update their status.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>

            <p className="mt-2 text-2xl font-bold text-gray-800">
              {orders.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>

            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {
                orders.filter(
                  (order) => order.status === "Pending"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Shipped</p>

            <p className="mt-2 text-2xl font-bold text-purple-600">
              {
                orders.filter(
                  (order) => order.status === "Shipped"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Delivered</p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {
                orders.filter(
                  (order) => order.status === "Delivered"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="text-gray-500">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Order ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Qty
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Total
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
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
                    className="border-b transition hover:bg-gray-50 last:border-b-0"
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-500">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {order.user?.name || "Unknown"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {order.user?.email || ""}
                      </p>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">
                        {order.product?.title || "Product"}
                      </p>

                      <p className="text-sm text-gray-500">
                        ৳{order.product?.price || 0}
                      </p>
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-4 text-gray-700">
                      {order.quantity}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ৳{getTotalPrice(order)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        disabled={
                          updatingOrderId === order.id ||
                          order.status === "Delivered" ||
                          order.status === "Cancelled"
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target.value as OrderStatus
                          )
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                      >
                        {getStatusOptions(order.status).map(
                          (status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          )
                        )}
                      </select>

                      {updatingOrderId === order.id && (
                        <p className="mt-1 text-xs text-gray-500">
                          Updating...
                        </p>
                      )}
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
