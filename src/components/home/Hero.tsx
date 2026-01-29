import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-children.jpg";
import communityOutreach from "@/assets/community-outreach.jpg";
import distribution from "@/assets/distribution.jpg";
import girlReading from "@/assets/girl-reading.jpg";

const slides = [
  {
    image: heroImage,
    title: "Raising the Hope of",
    highlight: "Rural Children",
    subtitle: "Initiative",
    description: "Empowering rural children through quality education, health awareness, cultural values, and rights advocacy to help them thrive in a modern world.",
    tagline: "From the Village to the World: Bridging Dreams, Unlocking Potentials",
  },
  {
    image: distribution,
    title: "Empowering Through",
    highlight: "Education",
    subtitle: "& Resources",
    description: "We distribute learning materials and educational resources to rural children, creating opportunities for a brighter future.",
    tagline: "Every child deserves access to quality education",
  },
  {
    image: communityOutreach,
    title: "Building Healthy",
    highlight: "Communities",
    subtitle: "Together",
    description: "Our comprehensive health programs ensure children have access to essential hygiene education and resources.",
    tagline: "Health and hygiene awareness for every child",
  },
  {
    image: girlReading,
    title: "Protecting Children's",
    highlight: "Rights",
    subtitle: "& Future",
    description: "We work tirelessly to protect children's rights and create safe, nurturing environments in rural communities.",
    tagline: "Advocacy and awareness for child protection",
  },
];

const Hero = () => {
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
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                {slides[currentSlide].tagline}
              </span>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6">
                {slides[currentSlide].title}{" "}
                <span className="text-secondary">{slides[currentSlide].highlight}</span>{" "}
                {slides[currentSlide].subtitle}
              </h1>

              <p className="text-background/90 text-lg md:text-xl font-body mb-8 max-w-xl">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/donate">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-6 text-lg">
                    Donate Now
                    <Heart className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-background text-background bg-background/10 hover:bg-background/20 font-semibold px-8 py-6 text-lg">
                    Learn More
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
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

export default Hero;
