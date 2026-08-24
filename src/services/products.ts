import api from "./api";

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  stock: number;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
}

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products");

  return response.data.data;
};

// Create product
export const createProduct = async (
  product: CreateProductData
): Promise<Product> => {
  const response = await api.post("/products", product);

  return response.data.data;
};

// Update product
export const updateProduct = async (
  id: string,
  product: UpdateProductData
): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, product);

  return response.data.data;
};

// Delete product
export const deleteProduct = async (
  id: string
): Promise<Product> => {
  const response = await api.delete(`/products/${id}`);

  return response.data.data;
};