"use client";

import { useEffect, useState } from "react";
import { getMyOrders, Order } from "@/services/orders";
import { createReview } from "@/services/reviews";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewingOrder, setReviewingOrder] =
    useState<Order | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] =
    useState(false);

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

  const handleReview = (order: Order) => {
    setReviewingOrder(order);
    setReviewRating(5);
    setReviewComment("");
  };

  const handleCreateReview = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!reviewingOrder) return;

    if (reviewRating < 1 || reviewRating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    if (!reviewComment.trim()) {
      alert("Please write a comment.");
      return;
    }

    try {
      setSubmittingReview(true);

      await createReview({
        productId: reviewingOrder.productId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      alert("Review created successfully!");

      setReviewingOrder(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (error: any) {
      console.error("Review error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to create review"
      );
    } finally {
      setSubmittingReview(false);
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
              Your orders will appear here after you place an
              order.
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

                <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    Ordered:{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>

                  <button
                    onClick={() => handleReview(order)}
                    disabled={
                      order.status === "Cancelled"
                    }
                    className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Write Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Write Review
              </h2>

              <p className="mb-6 text-gray-500">
                {reviewingOrder.product?.title || "Product"}
              </p>

              <form
                onSubmit={handleCreateReview}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Rating
                  </label>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setReviewRating(rating)
                        }
                        className={`h-10 w-10 rounded-lg border font-semibold ${
                          reviewRating === rating
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-700 hover:bg-purple-100"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="review-comment"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Comment
                  </label>

                  <textarea
                    id="review-comment"
                    value={reviewComment}
                    onChange={(event) =>
                      setReviewComment(event.target.value)
                    }
                    placeholder="Write your review..."
                    rows={4}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewingOrder(null)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingReview
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}