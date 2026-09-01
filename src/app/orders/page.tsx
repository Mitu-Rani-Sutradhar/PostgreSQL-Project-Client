
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
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

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
    if (order.status !== "Delivered") {
      return;
    }

    setReviewingOrder(order);
    setReviewRating(5);
    setReviewComment("");
  };

  const handleCreateReview = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!reviewingOrder) return;

    if (reviewingOrder.status !== "Delivered") {
      alert("You can review a product only after it is delivered.");
      return;
    }

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

  const getTotalPrice = (order: Order) => {
    return (order.product?.price || 0) * order.quantity;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="rounded-xl bg-white px-8 py-6 text-center shadow">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

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
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-semibold text-red-700">
              Unable to load orders
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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Orders
          </h1>

          <p className="mt-2 text-gray-500">
            View your order history and current order status.
          </p>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
              🛍️
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-700">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your orders will appear here after you place an
              order.
            </p>

            <button
              onClick={() => router.push("/products")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* Order Header */}
                <div className="border-b bg-gray-50 px-5 py-4 md:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Order ID
                      </p>

                      <p className="mt-1 break-all font-mono text-sm text-gray-700">
                        {order.id}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-5 md:p-6">
                  <div className="grid gap-6 md:grid-cols-[1fr_auto]">
                    {/* Product Information */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {order.product?.title || "Product"}
                      </h2>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-gray-500">
                            Unit Price
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            ৳{order.product?.price || 0}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Quantity
                          </p>

                          <p className="mt-1 font-semibold text-gray-800">
                            {order.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Total Price
                          </p>

                          <p className="mt-1 text-lg font-bold text-blue-600">
                            ৳{getTotalPrice(order)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">
                            Ordered On
                          </p>

                          <p className="mt-1 font-medium text-gray-800">
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review */}
                    <div className="flex items-end md:min-w-[150px] md:justify-end">
                      {order.status === "Delivered" ? (
                        <button
                          onClick={() => handleReview(order)}
                          className="w-full rounded-lg bg-purple-600 px-5 py-2.5 font-semibold text-white transition hover:bg-purple-700 sm:w-auto"
                        >
                          Write Review
                        </button>
                      ) : (
                        <p className="text-sm text-gray-400">
                          Review available after delivery
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-6 border-t pt-5">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Order Status
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      {(
                        [
                          "Pending",
                          "Confirmed",
                          "Shipped",
                          "Delivered",
                        ] as const
                      ).map((status, index) => {
                        const statuses = [
                          "Pending",
                          "Confirmed",
                          "Shipped",
                          "Delivered",
                        ];

                        const currentIndex =
                          statuses.indexOf(order.status);

                        const statusIndex =
                          statuses.indexOf(status);

                        const active =
                          order.status === status;

                        const completed =
                          currentIndex >= statusIndex;

                        return (
                          <div
                            key={status}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={`rounded-full px-3 py-1.5 font-medium ${
                                active
                                  ? getStatusClass(status)
                                  : completed
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {status}
                            </span>

                            {index < 3 && (
                              <span className="text-gray-300">
                                →
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {order.status === "Cancelled" && (
                        <span className="rounded-full bg-red-100 px-3 py-1.5 font-medium text-red-700">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewingOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
            onClick={() => {
              if (!submittingReview) {
                setReviewingOrder(null);
              }
            }}
          >
            <div
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Write Review
                </h2>

                <p className="mt-1 text-gray-500">
                  {reviewingOrder.product?.title || "Product"}
                </p>
              </div>

              <form
                onSubmit={handleCreateReview}
                className="space-y-5"
              >
                {/* Rating */}
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
                        className={`flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-bold transition ${
                          reviewRating === rating
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Selected rating: {reviewRating}/5
                  </p>
                </div>

                {/* Comment */}
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
                    placeholder="Share your experience with this product..."
                    rows={5}
                    maxLength={500}
                    required
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {reviewComment.length}/500
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewingOrder(null)
                    }
                    disabled={submittingReview}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
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