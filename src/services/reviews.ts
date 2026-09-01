
import api from "./api";

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    name: string;
    email: string;
  };

  product?: {
    id: string;
    title: string;
    description?: string;
    price: number;
    stock?: number;
  };
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

// =========================
// Get All Reviews
// =========================
export const getReviews = async (): Promise<Review[]> => {
  const response = await api.get("/reviews");

  return response.data.data;
};

// =========================
// Create Review
// =========================
export const createReview = async (
  data: CreateReviewData
): Promise<Review> => {
  const response = await api.post("/reviews", data);

  return response.data.data;
};

// =========================
// Update Review
// =========================
export const updateReview = async (
  id: string,
  data: UpdateReviewData
): Promise<Review> => {
  const response = await api.patch(`/reviews/${id}`, data);

  return response.data.data;
};

// =========================
// Delete Review
// =========================
export const deleteReview = async (
  id: string
): Promise<Review> => {
  const response = await api.delete(`/reviews/${id}`);

  return response.data.data;
};
