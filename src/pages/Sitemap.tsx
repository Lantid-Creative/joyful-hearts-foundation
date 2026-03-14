import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://heart-of-joy-ng.lovable.app";

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/programs", priority: "0.8", changefreq: "monthly" },
  { path: "/gallery", priority: "0.6", changefreq: "monthly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/events", priority: "0.7", changefreq: "weekly" },
  { path: "/contact", priority: "0.6", changefreq: "yearly" },
  { path: "/donate", priority: "0.9", changefreq: "monthly" },
  { path: "/volunteer", priority: "0.7", changefreq: "monthly" },
  { path: "/partner", priority: "0.7", changefreq: "monthly" },
];

const Sitemap = () => {
  useEffect(() => {
    const generateSitemap = async () => {
      // Fetch dynamic content
      const [blogsRes, programsRes] = await Promise.all([
        supabase.from("blog_posts").select("slug, updated_at").eq("is_published", true),
        supabase.from("programs").select("slug, updated_at").eq("is_active", true),
      ]);

      const dynamicUrls: string[] = [];

      programsRes.data?.forEach((p) => {
        dynamicUrls.push(
          `  <url>\n    <loc>${BASE_URL}/programs/${p.slug}</loc>\n    <lastmod>${new Date(p.updated_at).toISOString().split("T")[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        );
      });

      blogsRes.data?.forEach((b) => {
        dynamicUrls.push(
          `  <url>\n    <loc>${BASE_URL}/blog/${b.slug}</loc>\n    <lastmod>${new Date(b.updated_at).toISOString().split("T")[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
        );
      });

      const staticUrls = staticPages.map(
        (p) =>
          `  <url>\n    <loc>${BASE_URL}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
      );

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...dynamicUrls].join("\n")}
</urlset>`;

      // Serve as XML
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      window.location.replace(url);
    };

    generateSitemap();
  }, []);

  return null;
};

export default Sitemap;
