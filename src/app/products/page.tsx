
"use client";

import { useEffect, useState } from "react";

import {
  getProducts,
  Product,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products";

import { createOrder } from "@/services/orders";

import { createReview } from "@/services/reviews";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userRole, setUserRole] = useState("");

  // =========================
  // Create Product
  // =========================
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [creating, setCreating] = useState(false);

  // =========================
  // Edit Product
  // =========================
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [updating, setUpdating] = useState(false);

  // =========================
  // Delete Product
  // =========================
  const [deletingProductId, setDeletingProductId] =
    useState<string | null>(null);

  // =========================
  // Review
  // =========================
  const [reviewingProduct, setReviewingProduct] =
    useState<Product | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // =========================
  // Load Products + User
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role || "");
      } catch {
        localStorage.removeItem("user");
      }
    }

    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error: any) {
        console.error("Products error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // =========================
  // Create Order
  // =========================
  const handleOrder = async (product: Product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    const quantityText = prompt(
      `Enter quantity for "${product.title}":`
    );

    if (!quantityText) return;

    const quantity = Number(quantityText);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} items are available.`);
      return;
    }

    try {
      await createOrder({
        productId: product.id,
        quantity,
      });

      alert("Order created successfully!");

      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      console.error("Order error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to create order"
      );
    }
  };

  // =========================
  // Open Edit
  // =========================
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditDescription(product.description || "");
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
  };

  // =========================
  // Update Product
  // =========================
  const handleUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingProduct) return;

    const price = Number(editPrice);
    const stock = Number(editStock);

    if (!editTitle.trim()) {
      alert("Product title is required.");
      return;
    }

    if (!Number.isInteger(price) || price < 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Please enter a valid stock.");
      return;
    }

    try {
      setUpdating(true);

      const updatedProduct = await updateProduct(
        editingProduct.id,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          price,
          stock,
        }
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === updatedProduct.id
            ? updatedProduct
            : product
        )
      );

      setEditingProduct(null);

      alert("Product updated successfully!");
    } catch (error: any) {
      console.error("Update product error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================
  // Create Product
  // =========================
  const handleCreateProduct = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const price = Number(newPrice);
    const stock = Number(newStock);

    if (!newTitle.trim()) {
      alert("Product title is required.");
      return;
    }

    if (!Number.isInteger(price) || price < 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Please enter a valid stock.");
      return;
    }

    try {
      setCreating(true);

      const createdProduct = await createProduct({
        title: newTitle.trim(),
        description: newDescription.trim(),
        price,
        stock,
      });

      setProducts((currentProducts) => [
        createdProduct,
        ...currentProducts,
      ]);

      setNewTitle("");
      setNewDescription("");
      setNewPrice("");
      setNewStock("");
      setShowCreateForm(false);

      alert("Product created successfully!");
    } catch (error: any) {
      console.error("Create product error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to create product"
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // Delete Product
  // =========================
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setDeletingProductId(id);

      await deleteProduct(id);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );

      alert("Product deleted successfully!");
    } catch (error: any) {
      console.error("Delete product error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  // =========================
  // Open Review
  // =========================
  const handleReview = (product: Product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to write a review.");
      return;
    }

    setReviewingProduct(product);
    setReviewRating(5);
    setReviewComment("");
  };

  // =========================
  // Create Review
  // =========================
  const handleCreateReview = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!reviewingProduct) return;

    const comment = reviewComment.trim();

    if (reviewRating < 1 || reviewRating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    if (!comment) {
      alert("Please write a review comment.");
      return;
    }

    if (comment.length < 3) {
      alert("Review must contain at least 3 characters.");
      return;
    }

    try {
      setSubmittingReview(true);

      await createReview({
        productId: reviewingProduct.id,
        rating: reviewRating,
        comment,
      });

      alert("Review created successfully!");

      setReviewingProduct(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (error: any) {
      console.error("Create review error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to create review"
      );
    } finally {
      setSubmittingReview(false);
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
            Loading products...
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

  const canManageProducts =
    userRole === "Admin" || userRole === "Manager";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            Header
        ========================= */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Products
            </h1>

            <p className="mt-1 text-gray-500">
              Browse products, place orders, and share reviews.
            </p>
          </div>

          {canManageProducts && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 sm:w-auto"
            >
              + Add Product
            </button>
          )}
        </div>

        {/* =========================
            Product Count
        ========================= */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Available Products
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-800">
            {products.length}
          </p>
        </div>

        {/* =========================
            Products
        ========================= */}
        {products.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-700">
              No products found
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no active products.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Product Info */}
                <div className="flex-1">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {product.title}
                    </h2>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock > 0
                        ? "In Stock"
                        : "Out"}
                    </span>
                  </div>

                  <p className="mb-5 min-h-[48px] text-sm leading-6 text-gray-600">
                    {product.description ||
                      "No description available."}
                  </p>

                  <div className="mb-5 space-y-2">
                    <p className="text-2xl font-bold text-blue-600">
                      ৳{product.price}
                    </p>

                    <p className="text-sm text-gray-500">
                      Stock:{" "}
                      <span className="font-semibold text-gray-700">
                        {product.stock}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Order */}
                {product.stock > 0 ? (
                  <button
                    onClick={() => handleOrder(product)}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Order Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2.5 font-semibold text-gray-500"
                  >
                    Out of Stock
                  </button>
                )}

                {/* Review */}
                <button
                  onClick={() => handleReview(product)}
                  className="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white transition hover:bg-purple-700"
                >
                  Write Review
                </button>

                {/* Admin / Manager */}
                {canManageProducts && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 font-semibold text-white transition hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(product.id)
                      }
                      disabled={
                        deletingProductId === product.id
                      }
                      className="flex-1 rounded-lg bg-red-500 px-3 py-2 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingProductId === product.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =========================
            Create Product Modal
        ========================= */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Create Product
              </h2>

              <form
                onSubmit={handleCreateProduct}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title
                  </label>

                  <input
                    type="text"
                    value={newTitle}
                    onChange={(event) =>
                      setNewTitle(event.target.value)
                    }
                    placeholder="Product title"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(event.target.value)
                    }
                    placeholder="Product description"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={(event) =>
                      setNewPrice(event.target.value)
                    }
                    placeholder="500"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(event) =>
                      setNewStock(event.target.value)
                    }
                    placeholder="100"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateForm(false)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating
                      ? "Creating..."
                      : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            Edit Product Modal
        ========================= */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Edit Product
              </h2>

              <form
                onSubmit={handleUpdate}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title
                  </label>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(event.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(event) =>
                      setEditPrice(event.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(event) =>
                      setEditStock(event.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct(null)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating
                      ? "Updating..."
                      : "Update Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            Review Modal
        ========================= */}
        {reviewingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Write Review
              </h2>

              <p className="mt-1 text-gray-500">
                {reviewingProduct.title}
              </p>

              <form
                onSubmit={handleCreateReview}
                className="mt-6 space-y-5"
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
                        aria-label={`Rate ${rating} out of 5`}
                        className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-bold transition ${
                          reviewRating === rating
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Selected rating:{" "}
                    <span className="font-semibold">
                      {reviewRating}/5
                    </span>
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label
                    htmlFor="product-review-comment"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Comment
                  </label>

                  <textarea
                    id="product-review-comment"
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

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewingProduct(null)
                    }
                    disabled={submittingReview}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
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

