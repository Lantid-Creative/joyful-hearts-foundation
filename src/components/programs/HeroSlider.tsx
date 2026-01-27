import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import communityOutreach from "@/assets/community-outreach.jpg";
import distribution from "@/assets/distribution.jpg";
import girlReading from "@/assets/girl-reading.jpg";

const slides = [
  {
    image: distribution,
    title: "Empowering Rural Children",
    subtitle: "Through Education & Resources",
    description: "We distribute learning materials and educational resources to rural children, creating opportunities for a brighter future.",
  },
  {
    image: communityOutreach,
    title: "Building Healthy Communities",
    subtitle: "Health & Hygiene Programs",
    description: "Our comprehensive health programs ensure children have access to essential hygiene education and resources.",
  },
  {
    image: girlReading,
    title: "Protecting Children's Rights",
    subtitle: "Advocacy & Awareness",
    description: "We work tirelessly to protect children's rights and create safe, nurturing environments in rural communities.",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const handleManualNavigation = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl text-background"
            >
              <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
                {slides[currentSlide].subtitle}
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {slides[currentSlide].title}
              </h1>
              <p className="font-body text-lg md:text-xl text-background/90 mb-8">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleManualNavigation(prevSlide)}
          className="bg-background/20 border-background/30 text-background hover:bg-background/40 hover:text-background backdrop-blur-sm"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleManualNavigation(nextSlide)}
          className="bg-background/20 border-background/30 text-background hover:bg-background/40 hover:text-background backdrop-blur-sm"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleManualNavigation(() => setCurrentSlide(index))}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-secondary w-8"
                : "bg-background/50 hover:bg-background/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
