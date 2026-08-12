import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  canonicalPath = "",
  keywords,
  type = "website",
  noIndex = false,
}: SEOHeadProps) => {
  const baseUrl = "https://carwashap.com";
  const fullUrl = `${baseUrl}${canonicalPath}`;
  const fullTitle = title.includes("Car Washap") ? title : `${title} | Car Washap`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (selector: string, content: string, attribute = "content") => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (element) {
        element.setAttribute(attribute, content);
      } else {
        element = document.createElement("meta");
        const [attr, value] = selector.replace(/[\[\]"']/g, "").split("=");
        if (attr === "name" || attr === "property") {
          element.setAttribute(attr, value);
        }
        element.setAttribute(attribute, content);
        document.head.appendChild(element);
      }
    };

    // Primary Meta Tags
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[name="title"]', fullTitle);
    if (keywords) {
      updateMeta('meta[name="keywords"]', keywords);
    }
    updateMeta('meta[name="robots"]', noIndex ? "noindex, nofollow" : "index, follow");

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = fullUrl;
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = fullUrl;
      document.head.appendChild(canonical);
    }

    // Open Graph
    updateMeta('meta[property="og:title"]', fullTitle);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:url"]', fullUrl);
    updateMeta('meta[property="og:type"]', type);

    // Twitter
    updateMeta('meta[property="twitter:title"]', fullTitle);
    updateMeta('meta[property="twitter:description"]', description);
    updateMeta('meta[property="twitter:url"]', fullUrl);

    // Cleanup function to restore defaults when component unmounts
    return () => {
      document.title = "Biltvätt Borlänge | Car Washap – Professionell Handtvätt vid Kupolen";
    };
  }, [fullTitle, description, fullUrl, keywords, type, noIndex]);

  return null;
};

export default SEOHead;