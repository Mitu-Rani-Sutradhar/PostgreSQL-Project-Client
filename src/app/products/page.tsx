"use client";

import { useEffect, useState } from "react";
import { getProducts, Product } from "@/services/products";
import { createOrder } from "@/services/orders";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading products...</p>
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
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Products
        </h1>

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
                  {product.description}
                </p>

                <p className="mb-2 font-semibold">
                  Price: ৳{product.price}
                </p>

                <p className="mb-4 text-sm text-gray-500">
                  Stock: {product.stock}
                </p>

                {product.stock > 0 ? (
                  <button
                    onClick={() => handleOrder(product.id)}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}