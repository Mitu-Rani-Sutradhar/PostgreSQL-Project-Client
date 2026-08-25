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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUserId(user.id);
      } catch {
        console.error("Failed to read user");
      }
    }

    const loadReviews = async () => {
      try {
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

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingReview) return;

    if (editRating < 1 || editRating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    if (!editComment.trim()) {
      alert("Comment is required.");
      return;
    }

    try {
      setUpdating(true);

      const updated = await updateReview(
        editingReview.id,
        {
          rating: editRating,
          comment: editComment.trim(),
        }
      );

      setReviews((current) =>
        current.map((review) =>
          review.id === updated.id ? updated : review
        )
      );

      setEditingReview(null);

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

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteReview(id);

      setReviews((current) =>
        current.filter((review) => review.id !== id)
      );

      alert("Review deleted successfully!");
    } catch (error: any) {
      console.error("Delete review error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete review"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading reviews...</p>
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
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Customer Reviews
        </h1>

        {reviews.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold">
              No reviews yet
            </h2>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => {
              const isOwner =
                review.userId === currentUserId;

              return (
                <div
                  key={review.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {review.user?.name || "Customer"}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-gray-700">
                    {review.comment}
                  </p>

                  {isOwner && (
                    <div className="mt-5 flex gap-3 border-t pt-4">
                      <button
                        onClick={() => handleEdit(review)}
                        className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(review.id)
                        }
                        disabled={deleting}
                        className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Review Modal */}
        {editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold">
                Edit Review
              </h2>

              <form
                onSubmit={handleUpdate}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block font-medium">
                    Rating
                  </label>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setEditRating(rating)
                        }
                        className={`h-10 w-10 rounded-lg ${
                          editRating === rating
                            ? "bg-purple-600 text-white"
                            : "border bg-white"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-review-comment"
                    className="mb-2 block font-medium"
                  >
                    Comment
                  </label>

                  <textarea
                    id="edit-review-comment"
                    value={editComment}
                    onChange={(event) =>
                      setEditComment(event.target.value)
                    }
                    rows={4}
                    required
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingReview(null)
                    }
                    className="flex-1 rounded-lg border px-4 py-2.5 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
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