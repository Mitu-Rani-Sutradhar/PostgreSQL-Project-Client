import api from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "User" | "Admin" | "Manager";
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Register
export const registerUser = async (
  data: RegisterData
): Promise<User> => {
  const response = await api.post("/users/register", data);

  return response.data.data;
};

// Login
export const loginUser = async (
  data: LoginData
): Promise<LoginResponse> => {
  const response = await api.post("/users/login", data);

  return response.data.data;
};

// Get current user
export const getMe = async (): Promise<User> => {
  const response = await api.get("/users/me");

  return response.data.data;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};