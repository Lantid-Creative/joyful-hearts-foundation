import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, HandHeart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: Heart,
      title: "Make a Donation",
      description: "Your generous contribution can help provide educational materials, health resources, and safe spaces for rural children.",
      button: "Donate Now",
      link: "/donate",
      primary: true,
    },
    {
      icon: HandHeart,
      title: "Become a Volunteer",
      description: "Join our team of dedicated volunteers making a difference in rural communities across Nigeria.",
      button: "Join Us",
      link: "/contact",
      primary: false,
    },
    {
      icon: Users,
      title: "Partner With Us",
      description: "Organizations, schools, and faith-based groups can collaborate with us for sustainable rural child development.",
      button: "Contact Us",
      link: "/contact",
      primary: false,
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
            Get Involved
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How You Can Help
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Together, we can create a brighter future for every rural child. 
            Choose how you'd like to make a difference today.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`rounded-2xl p-8 text-center ${
                card.primary
                  ? "bg-gradient-hero text-background"
                  : "bg-card shadow-card"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  card.primary
                    ? "bg-background/20"
                    : "bg-primary/10"
                }`}
              >
                <card.icon
                  className={`w-8 h-8 ${
                    card.primary ? "text-background" : "text-primary"
                  }`}
                />
              </div>
              <h3
                className={`font-display text-xl font-semibold mb-4 ${
                  card.primary ? "text-background" : "text-foreground"
                }`}
              >
                {card.title}
              </h3>
              <p
                className={`font-body mb-6 ${
                  card.primary ? "text-background/90" : "text-muted-foreground"
                }`}
              >
                {card.description}
              </p>
              <Link to={card.link}>
                <Button
                  variant={card.primary ? "secondary" : "default"}
                  size="lg"
                  className={`font-semibold ${
                    card.primary
                      ? "bg-background text-foreground hover:bg-background/90"
                      : ""
                  }`}
                >
                  {card.button}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
