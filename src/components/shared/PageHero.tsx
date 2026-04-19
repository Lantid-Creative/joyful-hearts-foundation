import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useSiteImage } from "@/hooks/useSiteImages";

interface PageHeroProps {
  slot: string;
  /** Visual variant when no admin image is set */
  fallbackVariant?: "hope" | "hero";
  /** Section above-fade text color: light = on dark image, dark = on light bg */
  toneOnImage?: "light" | "dark";
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Override alt text */
  altFallback?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Page hero that prefers an admin-uploaded image from `site_images` (by slot).
 * Falls back to a brand gradient when no image is set.
 */
const PageHero = ({
  slot,
  fallbackVariant = "hope",
  toneOnImage = "light",
  eyebrow,
  title,
  description,
  icon,
  altFallback,
  className = "",
  children,
}: PageHeroProps) => {
  const { image } = useSiteImage(slot);
  const hasImage = !!image?.url;

  const fallbackBg =
    fallbackVariant === "hero" ? "bg-gradient-hero" : "bg-gradient-hope";

  // When using fallback gradient, keep the original page text colors:
  // - hope: dark text on light gradient
  // - hero: light text on dark gradient
  const fallbackTextOnDark = fallbackVariant === "hero";

  // When an image is set, we always overlay dark and use light text.
  const useLightText = hasImage ? toneOnImage === "light" : fallbackTextOnDark;

  const eyebrowColor = useLightText ? "text-secondary" : "text-secondary";
  const titleColor = useLightText ? "text-background" : "text-foreground";
  const descColor = useLightText ? "text-background/90" : "text-muted-foreground";

  return (
    <section
      className={`relative py-24 overflow-hidden ${
        hasImage ? "" : fallbackBg
      } ${className}`}
    >
      {hasImage && (
        <div className="absolute inset-0">
          <img
            src={image!.url}
            alt={image!.alt_text || altFallback || (typeof title === "string" ? title : "")}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {icon && (
            <div className="mb-6 flex justify-center">{icon}</div>
          )}
          {eyebrow && (
            <span className={`${eyebrowColor} font-semibold font-body text-sm uppercase tracking-wider mb-2 block`}>
              {eyebrow}
            </span>
          )}
          <h1 className={`font-display text-4xl md:text-5xl font-bold mb-6 ${titleColor}`}>
            {title}
          </h1>
          {description && (
            <p className={`font-body text-lg ${descColor}`}>{description}</p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
