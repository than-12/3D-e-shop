// Τύποι χρήστη
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt?: string;
}

// Τύποι κατηγορίας
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  messages?: Message[];
}

// Τύποι μηνύματος
export interface Message {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  categoryId?: string;
  category?: Category;
}

// Τύποι απόκρισης API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Τύποι κατάστασης αυθεντικοποίησης
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Τύποι κατάστασης μηνυμάτων
export interface MessagesState {
  messages: Message[];
  message: Message | null;
  isLoading: boolean;
  error: string | null;
}

// Τύποι κατάστασης κατηγοριών
export interface CategoriesState {
  categories: Category[];
  category: Category | null;
  isLoading: boolean;
  error: string | null;
} 