// Google Analytics
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || '';

// Προσθήκη στο window object για TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Βοηθητική συνάρτηση gtag
const gtag = function(...args: any[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }
};

// Αρχικοποίηση Google Analytics
export const initGA = () => {
  // Αν δεν υπάρχει GA ID, μην κάνεις τίποτα
  if (!GA_TRACKING_ID) {
    console.log('Google Analytics ID not found. Skipping initialization.');
    return;
  }

  if (typeof window !== 'undefined' && !window.gtag) {
    try {
      // Add Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_TRACKING_ID, {
        page_path: window.location.pathname,
      });
    } catch (error) {
      console.warn("Error initializing Google Analytics:", error);
    }
  }
};

// Παρακολούθηση αλλαγής σελίδας
export const logPageView = (url: string) => {
  if (!GA_TRACKING_ID) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
      });
    } catch (error) {
      console.warn("Error logging page view:", error);
    }
  }
};

// Παρακολούθηση συμβάντος
export const logEvent = (action: string, category: string, label: string, value?: number) => {
  if (!GA_TRACKING_ID) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    } catch (error) {
      console.warn("Error logging event:", error);
    }
  }
};

// Παρακολούθηση εξαίρεσης/σφάλματος
export const logError = (description: string, fatal: boolean = false) => {
  if (!GA_TRACKING_ID) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', 'exception', {
        description,
        fatal,
      });
    } catch (error) {
      console.warn("Error logging exception:", error);
    }
  }
}; 