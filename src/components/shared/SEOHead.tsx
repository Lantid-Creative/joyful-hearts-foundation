import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
}

const SEOHead = ({ title, description, path = "", image, type = "website" }: SEOHeadProps) => {
  const baseUrl = "https://heart-of-joy-ng.lovable.app";
  const fullUrl = `${baseUrl}${path}`;
  const ogImage = image || `${baseUrl}/favicon.png`;

  useEffect(() => {
    document.title = `${title} | RHRCI`;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", fullUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:image", ogImage, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    // Set canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;
  }, [title, description, fullUrl, ogImage, type]);

  return null;
};

export default SEOHead;
