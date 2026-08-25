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
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

export const createReview = async (
  data: CreateReviewData
): Promise<Review> => {
  const response = await api.post("/reviews", data);

  return response.data.data;
};