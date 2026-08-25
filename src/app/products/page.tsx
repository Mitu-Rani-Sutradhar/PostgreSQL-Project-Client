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

import {
  createReview,
} from "@/services/reviews";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userRole, setUserRole] = useState("");

  // =========================
  // Edit Product States
  // =========================
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [updating, setUpdating] = useState(false);

  // =========================
  // Delete Product
  // =========================
  const [deleting, setDeleting] = useState(false);

  // =========================
  // Create Product States
  // =========================
  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] =
    useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [creating, setCreating] = useState(false);

  // =========================
  // Review States
  // =========================
  const [reviewingProduct, setReviewingProduct] =
    useState<Product | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] =
    useState(false);

  // =========================
  // Load User + Products
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
      } catch (error) {
        console.error("User parse error:", error);
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
  const handleOrder = async (productId: string) => {
    try {
      const quantityText = prompt("Enter quantity:");

      if (!quantityText) return;

      const quantity = Number(quantityText);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
      }

      await createOrder({
        productId,
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
  // Open Edit Product
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

      await updateProduct(editingProduct.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        price,
        stock,
      });

      alert("Product updated successfully!");

      setEditingProduct(null);

      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      console.error("Update error:", error);

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
        ...currentProducts,
        createdProduct,
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
      setDeleting(true);

      await deleteProduct(id);

      alert("Product deleted successfully!");

      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      console.error("Delete error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // Open Review Modal
  // =========================
  const handleReview = (product: Product) => {
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

    if (
      !Number.isInteger(reviewRating) ||
      reviewRating < 1 ||
      reviewRating > 5
    ) {
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
        productId: reviewingProduct.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      alert("Review created successfully!");

      setReviewingProduct(null);
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

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading products...</p>
      </main>
    );
  }

  // =========================
  // Error
  // =========================
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* =========================
            Header
        ========================= */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Products
          </h1>

          {/* Admin / Manager */}
          {(userRole === "Admin" ||
            userRole === "Manager") && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              + Add Product
            </button>
          )}
        </div>

        {/* =========================
            Product List
        ========================= */}
        {products.length === 0 ? (
          <p className="text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <h2 className="mb-2 text-xl font-semibold text-gray-800">
                  {product.title}
                </h2>

                <p className="mb-4 text-gray-600">
                  {product.description ||
                    "No description"}
                </p>

                <p className="mb-2 font-semibold">
                  Price: ৳{product.price}
                </p>

                <p className="mb-4 text-sm text-gray-500">
                  Stock: {product.stock}
                </p>

                {/* =========================
                    Order
                ========================= */}
                {product.stock > 0 ? (
                  <button
                    onClick={() =>
                      handleOrder(product.id)
                    }
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Order Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2.5 font-semibold text-gray-500"
                  >
                    Out of Stock
                  </button>
                )}

                {/* =========================
                    Review
                ========================= */}
                <button
                  onClick={() => handleReview(product)}
                  className="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white transition hover:bg-purple-700"
                >
                  Write Review
                </button>

                {/* =========================
                    Admin / Manager
                ========================= */}
                {(userRole === "Admin" ||
                  userRole === "Manager") && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        handleEdit(product)
                      }
                      className="flex-1 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-white transition hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(product.id)
                      }
                      disabled={deleting}
                      className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            Create Product Modal
        ===================================================== */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Create Product
              </h2>

              <form
                onSubmit={handleCreateProduct}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="new-title"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>

                  <input
                    id="new-title"
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
                  <label
                    htmlFor="new-description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="new-description"
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(
                        event.target.value
                      )
                    }
                    placeholder="Product description"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-price"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Price
                  </label>

                  <input
                    id="new-price"
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
                  <label
                    htmlFor="new-stock"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Stock
                  </label>

                  <input
                    id="new-stock"
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
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* =====================================================
            Edit Product Modal
        ===================================================== */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Edit Product
              </h2>

              <form
                onSubmit={handleUpdate}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="edit-title"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>

                  <input
                    id="edit-title"
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
                  <label
                    htmlFor="edit-description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-price"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Price
                  </label>

                  <input
                    id="edit-price"
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
                  <label
                    htmlFor="edit-stock"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Stock
                  </label>

                  <input
                    id="edit-stock"
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
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* =====================================================
            Review Modal
        ===================================================== */}
        {reviewingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Write Review
              </h2>

              <p className="mb-6 text-gray-500">
                {reviewingProduct.title}
              </p>

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
                      setReviewComment(
                        event.target.value
                      )
                    }
                    placeholder="Write your review..."
                    rows={4}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setReviewingProduct(null)
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