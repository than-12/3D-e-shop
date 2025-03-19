import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalURL?: string;
}

export function SEO({ title, description, ogImage = "/logo.png", canonicalURL }: SEOProps) {
  useEffect(() => {
    // Ενημέρωση του τίτλου
    document.title = `${title} | 3D PrintCraft`;

    // Ενημέρωση των meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    // Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImgTag = document.querySelector('meta[property="og:image"]');

    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }
    if (ogDesc) {
      ogDesc.setAttribute("content", description);
    }
    if (ogImgTag) {
      ogImgTag.setAttribute("content", ogImage);
    }

    // Twitter
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const twitterImgTag = document.querySelector('meta[name="twitter:image"]');

    if (twitterTitle) {
      twitterTitle.setAttribute("content", title);
    }
    if (twitterDesc) {
      twitterDesc.setAttribute("content", description);
    }
    if (twitterImgTag) {
      twitterImgTag.setAttribute("content", ogImage);
    }

    // Canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    const url = canonicalURL || window.location.href;

    if (canonicalTag) {
      canonicalTag.setAttribute("href", url);
    }
  }, [title, description, ogImage, canonicalURL]);

  return null;
} 