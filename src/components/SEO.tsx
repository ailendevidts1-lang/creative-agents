import React, { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({ title, description, canonical, jsonLd }) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    const descTag =
      (document.querySelector('meta[name="description"]') as HTMLMetaElement) ||
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m as HTMLMetaElement;
      })();
    if (description) descTag.setAttribute("content", description);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical || window.location.href;

    // Structured data (JSON-LD)
    const scriptId = "seo-json-ld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonical, jsonLd]);

  return null;
};

export default SEO;
