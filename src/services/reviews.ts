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

// Get reviews
export const getReviews = async (): Promise<Review[]> => {
  const response = await api.get("/reviews");

  return response.data.data;
};

// Create review
export const createReview = async (
  data: CreateReviewData
): Promise<Review> => {
  const response = await api.post("/reviews", data);

  return response.data.data;
};

// Update review
export const updateReview = async (
  id: string,
  data: UpdateReviewData
): Promise<Review> => {
  const response = await api.patch(`/reviews/${id}`, data);

  return response.data.data;
};

// Delete review
export const deleteReview = async (
  id: string
): Promise<Review> => {
  const response = await api.delete(`/reviews/${id}`);

  return response.data.data;
};