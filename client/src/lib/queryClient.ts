import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_URL } from "@/config";
import apiClient from "./api"; // Χρησιμοποιούμε το apiClient από το api.ts

// Χρησιμοποιούμε το API_URL από το config αλλά αφαιρούμε το /api στο τέλος
// καθώς αυτό προστίθεται ήδη στα query keys
const API_BASE_URL = API_URL.endsWith('/api') 
  ? API_URL.slice(0, -4) // Αφαιρούμε το /api από το τέλος
  : API_URL;

console.log('Using API base URL:', API_BASE_URL);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log("API request redirected to mock API:", { method, url, data });
  
  let mockResponse: any = {};
  
  // Διαχειριζόμαστε διαφορετικά endpoints
  if (url.startsWith('/api/cart')) {
    if (method === 'POST') {
      mockResponse = await apiClient.addToCart(
        (data as any)?.productId || 1, 
        (data as any)?.quantity || 1, 
        data // Περνάμε ολόκληρο το data object για custom εκτυπώσεις
      );
    } else if (method === 'DELETE') {
      mockResponse = await apiClient.clearCart();
    } else {
      mockResponse = await apiClient.getCart();
    }
  } else if (url.startsWith('/api/custom-prints/calculate')) {
    // Χειρισμός για τον υπολογισμό κόστους 3D εκτύπωσης
    mockResponse = await apiClient.calculateCustomPrint(data);
  } else if (url.startsWith('/api/custom-prints')) {
    // Χειρισμός για τη δημιουργία custom εκτύπωσης
    mockResponse = await apiClient.createCustomPrint(data);
  } else if (url.startsWith('/api/contact')) {
    mockResponse = { success: true, message: 'Message sent successfully (mock)' };
  } else {
    console.warn(`No mock handler for ${method} ${url}, returning empty success response`);
    mockResponse = { success: true };
  }
  
  // Δημιουργούμε ένα Response αντικείμενο
  const response = new Response(JSON.stringify(mockResponse), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Προσθέτουμε ένα .json() μέθοδο για συμβατότητα
  Object.defineProperty(response, 'json', {
    writable: false,
    value: async () => mockResponse
  });
  
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log("Executing query with key:", queryKey);
    
    try {
      const res = await fetch(`${API_BASE_URL}${queryKey[0] as string}`, {
        credentials: "include",
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log("Query response status for", queryKey, ":", res.status);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      const data = await res.json();
      console.log("Query data for", queryKey, ":", 
        typeof data === 'object' ? 
          Array.isArray(data) ? 
            `Array with ${data.length} items` : 
            "Object returned" 
          : data);
      
      return data;
    } catch (error) {
      console.error(`Query failed for key ${queryKey}:`, error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`Πιθανό πρόβλημα δικτύου ή CORS για το ${queryKey[0]}. Βεβαιωθείτε ότι το API τρέχει.`);
      }
      
      throw error;
    }
  };

// Custom queryFn που χρησιμοποιεί απευθείας τα δεδομένα
const mockQueryFn: QueryFunction = async ({ queryKey }) => {
  const endpoint = queryKey[0] as string;
  console.log(`Query request for: ${endpoint} (using mock data)`);
  
  try {
    // Βάσει του endpoint, επιστρέφουμε τα κατάλληλα δεδομένα
    if (endpoint === '/api/categories') {
      return await apiClient.getCategories();
    }
    
    if (endpoint === '/api/products') {
      return await apiClient.getProducts();
    }
    
    if (endpoint === '/api/cart') {
      return await apiClient.getCart();
    }
    
    if (endpoint === '/api/me') {
      // Επιστρέφουμε null για τον χρήστη όταν δεν είναι συνδεδεμένος
      return null;
    }
    
    // Για επιμέρους προϊόντα
    if (endpoint.startsWith('/api/products/')) {
      const slug = endpoint.replace('/api/products/', '');
      return await apiClient.getProductBySlug(slug);
    }
    
    // Αν δεν έχουμε ειδικό χειρισμό για αυτό το endpoint
    console.warn(`No handler for endpoint: ${endpoint}, returning empty data`);
    return {};
  } catch (error) {
    console.error(`Query failed for key ${queryKey}:`, error);
    throw error;
  }
};

// Δημιουργούμε το QueryClient με το πραγματικό queryFn
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 λεπτό
      retry: 3,
    },
    mutations: {
      retry: 3,
    },
  },
});

// Βοηθητική συνάρτηση για αιτήσεις με timeout
export async function fetchWithTimeout(url: string, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include', // Πάντα συμπεριλαμβάνουμε cookies
      mode: 'cors' // Προσθέτουμε mode: 'cors' για να διαχειριστούμε CORS
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Βοηθητική συνάρτηση για επαναλήψεις αιτήσεων
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<Response>,
  maxRetries = 3
): Promise<T> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetchFn();
      
      // Κλωνοποιούμε την απάντηση για αποσφαλμάτωση
      const clonedResponse = response.clone();
      const textResponse = await clonedResponse.text();
      const contentPreview = textResponse.substring(0, 100) + (textResponse.length > 100 ? '...' : '');
      console.log(`API Response [${response.status}]:`, contentPreview);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Επαναδημιουργούμε JSON από το κείμενο
      const data = JSON.parse(textResponse) as T;
      return data;
    } catch (error) {
      retries++;
      console.error(`Request failed (attempt ${retries}/${maxRetries}):`, error);
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Εκθετική επιστροφή (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  throw new Error('Failed after multiple attempts');
}

// Ενημερωμένες συναρτήσεις που χρησιμοποιούν το mock API
export async function fetchProducts(
  params?: {
    category?: string;
    materials?: string;
    inStock?: boolean;
    featured?: boolean;
  }
) {
  console.log('Fetching products with params:', params);
  
  try {
    // Χρησιμοποιούμε το api client αντί για απευθείας HTTP αιτήματα
    const data = await apiClient.getProducts();
    console.log('Products fetched successfully:', Array.isArray(data) ? data.length : 'not an array');
    return data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function fetchCategories() {
  console.log('Fetching categories');
  
  try {
    // Χρησιμοποιούμε το api client αντί για απευθείας HTTP αιτήματα
    const data = await apiClient.getCategories();
    console.log('Categories fetched successfully:', Array.isArray(data) ? data.length : 'not an array');
    return data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}
