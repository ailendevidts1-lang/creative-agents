import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string; // can be absolute or a path like "/marketplace"
  structuredData?: Record<string, any> | string;
}

const SEO = ({ title, description, canonical, structuredData }: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const upsertMeta = (name: string, content: string) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    if (description) upsertMeta("description", description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      const href = canonical.startsWith("http")
        ? canonical
        : `${window.location.origin}${canonical}`;
      link.setAttribute("href", href);
    }

    const existingLd = document.getElementById("seo-ld-json");
    if (existingLd) existingLd.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "seo-ld-json";
      const payload = typeof structuredData === "string" ? structuredData : JSON.stringify(structuredData);
      script.textContent = payload;
      document.head.appendChild(script);
    }
  }, [title, description, canonical, structuredData]);

  return null;
};

export default SEO;
