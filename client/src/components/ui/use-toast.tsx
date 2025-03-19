import { useState } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

type ToastOptions = Partial<
  Pick<Toast, "title" | "description" | "action" | "variant">
>;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function toast(opts: ToastOptions | string) {
    const id = Math.random().toString(36).substring(2, 9); // Δημιουργία μοναδικού ID
    
    if (typeof opts === "string") {
      setToasts([...toasts, { id, description: opts }]);
      return;
    }

    setToasts([...toasts, { id, ...opts }]);
    
    // Αυτόματη αφαίρεση του toast μετά από 3 δευτερόλεπτα
    setTimeout(() => {
      setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
    }, 3000);
  }

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        setToasts((toasts) => toasts.filter((toast) => toast.id !== toastId));
      } else {
        setToasts([]);
      }
    },
  };
};