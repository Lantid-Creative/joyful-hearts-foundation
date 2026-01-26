import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Play, X, Image as ImageIcon, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroChildren from "@/assets/hero-children.jpg";
import girlReading from "@/assets/girl-reading.jpg";
import communityOutreach from "@/assets/community-outreach.jpg";
import culturalGames from "@/assets/cultural-games.jpg";
import distribution from "@/assets/distribution.jpg";
import villageLandscape from "@/assets/village-landscape.jpg";

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

const categories = ["All", "Education", "Health", "Culture", "Community", "Events", "General"];

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>(defaultGalleryItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryMedia = async () => {
      const { data, error } = await supabase
        .from("gallery_media")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const dbItems: MediaItem[] = data.map((item) => ({
          id: item.id,
          type: item.type as "image" | "video",
          src: item.url,
          thumbnail: item.thumbnail_url || item.url,
          title: item.title,
          category: item.category,
        }));
        setGalleryItems([...dbItems, ...defaultGalleryItems]);
      }
      setLoading(false);
    };

    fetchGalleryMedia();
  }, []);

  const filteredItems =
    selectedCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-hope">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
              Our Impact
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Gallery
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Explore moments of joy, learning, and transformation from our programs 
              and community activities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-body text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

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
              {selectedItem.type === "image" && (
                <img
                  src={selectedItem.src}
                  alt={selectedItem.title}
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
