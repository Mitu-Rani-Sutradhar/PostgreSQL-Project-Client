
"use client";

import { useEffect, useState } from "react";
import {
  getReviews,
  Review,
  updateReview,
  deleteReview,
} from "@/services/reviews";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");

  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const [updating, setUpdating] = useState(false);
  const [deletingReviewId, setDeletingReviewId] =
    useState<string | null>(null);

  // =========================
  // Load Reviews + User
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUserId(user.id || "");
      } catch {
        localStorage.removeItem("user");
      }
    }

    const loadReviews = async () => {
      try {
        setLoading(true);

        const data = await getReviews();

        setReviews(data);
      } catch (error: any) {
        console.error("Reviews error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load reviews"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // =========================
  // Edit Review
  // =========================
  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // =========================
  // Update Review
  // =========================
  const handleUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingReview) return;

    const comment = editComment.trim();

    if (
      !Number.isInteger(editRating) ||
      editRating < 1 ||
      editRating > 5
    ) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    if (!comment) {
      alert("Comment is required.");
      return;
    }

    if (comment.length < 3) {
      alert("Comment must contain at least 3 characters.");
      return;
    }

    try {
      setUpdating(true);

      const updated = await updateReview(
        editingReview.id,
        {
          rating: editRating,
          comment,
        }
      );

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === updated.id
            ? updated
            : review
        )
      );

      setEditingReview(null);
      setEditRating(5);
      setEditComment("");

      alert("Review updated successfully!");
    } catch (error: any) {
      console.error("Update review error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to update review"
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================
  // Delete Review
  // =========================
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setDeletingReviewId(id);

      await deleteReview(id);

      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) => review.id !== id
        )
      );

      alert("Review deleted successfully!");
    } catch (error: any) {
      console.error("Delete review error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete review"
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white px-8 py-6 shadow">
          <p className="text-lg font-medium text-gray-600">
            Loading reviews...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // Error
  // =========================
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="font-medium text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // Review Stats
  // =========================
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* =========================
            Header
        ========================= */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Reviews
          </h1>

          <p className="mt-2 text-gray-500">
            See what customers are saying about our products.
          </p>
        </div>

        {/* =========================
            Review Stats
        ========================= */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Reviews
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalReviews}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Average Rating
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {averageRating}
              </p>

              <div className="text-xl text-yellow-500">
                ★
              </div>

              <span className="text-sm text-gray-500">
                / 5
              </span>
            </div>
          </div>
        </div>

        {/* =========================
            Empty State
        ========================= */}
        {reviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl">
              ★
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-800">
              No reviews yet
            </h2>

            <p className="mt-2 text-gray-500">
              Be the first customer to share your experience.
            </p>
          </div>
        ) : (
          /* =========================
             Reviews List
          ========================= */
          <div className="space-y-5">
            {reviews.map((review) => {
              const isOwner =
                review.userId === currentUserId;

              return (
                <article
                  key={review.id}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  {/* Top */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                        {(
                          review.user?.name ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {review.user?.name ||
                            "Customer"}
                        </h2>

                        <p className="text-sm text-gray-500">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div
                      className="flex items-center gap-1"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <span
                            key={star}
                            className={`text-xl ${
                              star <= review.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        )
                      )}

                      <span className="ml-2 text-sm font-semibold text-gray-600">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Product */}
                  {review.product?.title && (
                    <div className="mt-5 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                      {review.product.title}
                    </div>
                  )}

                  {/* Comment */}
                  <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-700">
                    {review.comment}
                  </p>

                  {/* Owner Actions */}
                  {isOwner && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                      <button
                        onClick={() =>
                          handleEdit(review)
                        }
                        className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600"
                      >
                        Edit Review
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(review.id)
                        }
                        disabled={
                          deletingReviewId ===
                          review.id
                        }
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingReviewId ===
                        review.id
                          ? "Deleting..."
                          : "Delete Review"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* =========================
            Edit Review Modal
        ========================= */}
        {editingReview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setEditingReview(null);
              }
            }}
          >
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              {/* Modal Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Review
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your rating and review.
                </p>
              </div>

              <form
                onSubmit={handleUpdate}
                className="space-y-5"
              >
                {/* Rating */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Rating
                  </label>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(
                      (rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setEditRating(rating)
                          }
                          aria-label={`Set rating to ${rating}`}
                          className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-bold transition ${
                            editRating === rating
                              ? "border-purple-600 bg-purple-600 text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                          }`}
                        >
                          {rating}
                        </button>
                      )
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Selected rating:{" "}
                    <span className="font-semibold text-gray-700">
                      {editRating}/5
                    </span>
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="edit-review-comment"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Comment
                  </label>

                  <textarea
                    id="edit-review-comment"
                    value={editComment}
                    onChange={(event) =>
                      setEditComment(
                        event.target.value
                      )
                    }
                    rows={5}
                    maxLength={500}
                    required
                    placeholder="Write your review..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {editComment.length}/500
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReview(null);
                      setEditRating(5);
                      setEditComment("");
                    }}
                    disabled={updating}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating
                      ? "Updating..."
                      : "Update Review"}
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

