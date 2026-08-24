"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "../services/api";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get products
  const getProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Edit product
const handleEdit = (product: Product) => {
  setEditingId(product.id);
  setTitle(product.title);
  setDescription(product.description || "");
  setPrice(String(product.price));
  setStock(String(product.stock));
};

// Delete product
const handleDelete = async (id: string) => {
  try {
    const response = await api.delete(`/products/${id}`);

    console.log(response.data);

    // Refresh products
    getProducts();
  } catch (error) {
    console.error("Failed to delete product:", error);
  }
};

  // Add product
  // Add or Update product
// Add / Update product
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    if (editingId) {
      // Update product
      const response = await api.patch(`/products/${editingId}`, {
        title,
        description,
        price: Number(price),
        stock: Number(stock),
      });

      console.log(response.data);
    } else {
      // Create product
      const response = await api.post("/products", {
        title,
        description,
        price: Number(price),
        stock: Number(stock),
      });

      console.log(response.data);
    }

    // Clear form
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setEditingId(null);

    // Refresh products
    getProducts();

  } catch (error) {
    console.error("Failed to save product:", error);
  }
};
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading products...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-8">
          Product Management
        </h1>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-5">
            Add New Product
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Product title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />

            <textarea
              placeholder="Product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-3"
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />

            <input
              type="number"
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />
<button
  type="submit"
  className="bg-black text-white px-6 py-3 rounded-lg"
>
  {editingId ? "Update Product" : "Add Product"}
</button>

{editingId && (
  <button
    type="button"
    onClick={() => {
      setEditingId(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setStock("");
    }}
    className="ml-2 bg-gray-500 text-white px-6 py-3 rounded-lg"
  >
    Cancel
  </button>
)}
          </form>
        </div>

        {/* Products */}
        <h2 className="text-2xl font-bold mb-5">
          My Products
        </h2>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h3 className="text-xl font-bold mb-2">
                  {product.title}
                </h3>

                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>

                <p>
                  <span className="font-semibold">Price:</span>{" "}
                  ৳{product.price}
                </p>

                <p>
                  <span className="font-semibold">Stock:</span>{" "}
                  {product.stock}
                </p>

                <button
  onClick={() => handleEdit(product)}
  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
>
  Edit
</button>

<button
  onClick={() => handleDelete(product.id)}
  className="mt-4 ml-2 bg-red-600 text-white px-4 py-2 rounded-lg"
>
  Delete
</button>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}