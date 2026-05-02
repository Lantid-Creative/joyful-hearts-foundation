import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/shared/SEOHead";
import PageHero from "@/components/shared/PageHero";
import { Play, X, Image as ImageIcon, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroChildren from "@/assets/hero-children.webp";
import girlReading from "@/assets/girl-reading.webp";
import communityOutreach from "@/assets/community-outreach.webp";
import culturalGames from "@/assets/cultural-games.webp";
import distribution from "@/assets/distribution.webp";
import villageLandscape from "@/assets/village-landscape.webp";

type MediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  thumbnail: string;
  title: string;
  category: string;
};

// Default gallery items (used as fallback)
const defaultGalleryItems: MediaItem[] = [
  {
    id: "1",
    type: "image",
    src: heroChildren,
    thumbnail: heroChildren,
    title: "Children in Classroom",
    category: "Education",
  },
  {
    id: "2",
    type: "image",
    src: girlReading,
    thumbnail: girlReading,
    title: "Girl Reading",
    category: "Education",
  },
  {
    id: "3",
    type: "image",
    src: communityOutreach,
    thumbnail: communityOutreach,
    title: "Community Outreach",
    category: "Health",
  },
  {
    id: "4",
    type: "image",
    src: culturalGames,
    thumbnail: culturalGames,
    title: "Traditional Games",
    category: "Culture",
  },
  {
    id: "5",
    type: "image",
    src: distribution,
    thumbnail: distribution,
    title: "Materials Distribution",
    category: "Education",
  },
  {
    id: "6",
    type: "image",
    src: villageLandscape,
    thumbnail: villageLandscape,
    title: "Our Community",
    category: "Community",
  },
];

const Gallery = () => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>(defaultGalleryItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryMedia = async () => {
      const [galleryRes, libraryRes] = await Promise.all([
        supabase
          .from("gallery_media")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("media_library")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      const galleryItemsDb: MediaItem[] =
        !galleryRes.error && galleryRes.data
          ? galleryRes.data.map((item) => ({
              id: `gm-${item.id}`,
              type: item.type as "image" | "video",
              src: item.url,
              thumbnail: item.thumbnail_url || item.url,
              title: item.title,
              category: item.category,
            }))
          : [];

      // Avoid duplicates: skip library items whose URL already exists in gallery_media
      const existingUrls = new Set(galleryItemsDb.map((g) => g.src));

      const libraryItems: MediaItem[] =
        !libraryRes.error && libraryRes.data
          ? libraryRes.data
              .filter((m) => !existingUrls.has(m.url))
              .map((m) => ({
                id: `ml-${m.id}`,
                type: (m.type === "video" ? "video" : "image") as "image" | "video",
                src: m.url,
                thumbnail: m.url,
                title: m.alt_text || m.caption || m.file_name || "Media",
                category:
                  (m.tags && m.tags.length > 0 ? m.tags[0] : null) ||
                  (m.folder && m.folder !== "library" ? m.folder : "General"),
              }))
          : [];

      const combined = [...galleryItemsDb, ...libraryItems];
      setGalleryItems(combined.length > 0 ? combined : defaultGalleryItems);
      setLoading(false);
    };

    fetchGalleryMedia();
  }, []);

  const filteredItems = galleryItems;

  return (
    <Layout>
      <SEOHead title="Gallery" description="View photos and videos from RHRCI's community outreach, educational programs, and cultural events in rural Nigeria." path="/gallery" />
      <PageHero
        slot="page_gallery"
        eyebrow="Our Impact"
        title="Gallery"
        description="Explore moments of joy, learning, and transformation from our programs and community activities."
      />

      {/* Gallery Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-card"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-secondary font-body text-sm font-medium mb-1">
                        {item.category}
                      </span>
                      <h3 className="text-background font-display text-xl font-semibold">
                        {item.title}
                      </h3>
                    </div>

                    {/* Type Icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      {item.type === "video" ? (
                        <Play className="w-5 h-5 text-background" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-background" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-body">
                No items found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Video Section Placeholder */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
              Coming Soon
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Video Stories
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              We're working on bringing you inspiring video stories from our programs. 
              Check back soon to see the impact in action!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video bg-card rounded-xl shadow-card flex items-center justify-center"
              >
                <div className="text-center">
                  <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground font-body text-sm">Coming Soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-6 right-6 w-12 h-12 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center text-background hover:bg-background/30 transition-colors"
              onClick={() => setSelectedItem(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === "image" ? (
                <img
                  src={selectedItem.src}
                  alt={selectedItem.title}
                  className="w-full rounded-lg shadow-elevated"
                />
              ) : (
                <video
                  src={selectedItem.src}
                  controls
                  autoPlay
                  className="w-full rounded-lg shadow-elevated"
                />
              )}
              <div className="mt-4 text-center">
                <h3 className="text-background font-display text-2xl font-semibold">
                  {selectedItem.title}
                </h3>
                <p className="text-background/70 font-body">{selectedItem.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Gallery;
