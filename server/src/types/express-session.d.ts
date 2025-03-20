import 'express-session';

interface CartItem {
  id: number;
  productId: string | number;
  quantity: number;
  customData?: any;
}

declare module 'express-session' {
  interface Session {
    userId?: string;
    cart?: CartItem[];
  }
} 