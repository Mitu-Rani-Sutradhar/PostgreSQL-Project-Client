import api from "./api";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderUser {
  id: string;
  name: string;
  email: string;
  role?: "User" | "Admin" | "Manager";
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  status: OrderStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  product?: OrderProduct;
  user?: OrderUser;
}

export interface CreateOrderData {
  productId: string;
  quantity: number;
}

// Create order
export const createOrder = async (
  data: CreateOrderData
): Promise<Order> => {
  const response = await api.post("/orders", data);

  return response.data.data;
};

// Get my orders
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get("/orders");

  return response.data.data;
};

// Get all orders - Admin
export const getAllOrders = async (): Promise<Order[]> => {
  const response = await api.get("/orders/all");

  return response.data.data;
};

// Update order status
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  const response = await api.patch(`/orders/${id}/status`, {
    status,
  });

  return response.data.data;
};