import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import villageLandscape from "@/assets/village-landscape.webp";
import { useSiteImage } from "@/hooks/useSiteImages";

const stats = [
  { value: "1203+", label: "Children Reached" },
  { value: "10+", label: "Communities Served" },
  { value: "50+", label: "Volunteers" },
  { value: "9+", label: "Active Programs" },
];

const ImpactStats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { image: bgImage } = useSiteImage("section_impact_bg");
  const bgUrl = bgImage?.url || villageLandscape;
  const bgAlt = bgImage?.alt_text || "Rural village landscape";

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={bgUrl}
          alt={bgAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-foreground"
          style={{ opacity: Math.max(0, Math.min(80, bgImage?.overlay_opacity ?? 80)) / 100 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-background mb-4">
            Our Impact So Far
          </h2>
          <p className="text-background/80 font-body max-w-2xl mx-auto">
            Every number represents a life touched, a dream nurtured, and a future brightened.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-2">
                {stat.value}
              </div>
              <div className="text-background/80 font-body text-sm md:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
