import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Eye, Sparkles } from "lucide-react";

const MissionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: Target,
      title: "Our Mission",
      content:
        "To empower rural children by bridging the gap between them and their urban counterparts through access to quality education, health awareness, cultural values, and rights advocacy, ensuring they are equipped to thrive in a modern world while preserving their heritage.",
      color: "bg-primary",
    },
    {
      icon: Eye,
      title: "Our Vision",
      content:
        "A Nigeria where every rural child is informed, empowered, and confident, with equal access to opportunities, health, dignity, and cultural identity.",
      color: "bg-accent",
    },
    {
      icon: Sparkles,
      title: "Our Motto",
      content:
        "From the Village to the World: Bridging Dreams, Unlocking Potentials",
      color: "bg-secondary",
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-hope">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Drives Us
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            We are committed to transforming the lives of rural children through 
            sustainable initiatives that create lasting impact.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-shadow duration-300"
            >
              <div
                className={`w-14 h-14 ${card.color} rounded-xl flex items-center justify-center mb-6`}
              >
                <card.icon className="w-7 h-7 text-background" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                {card.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                {card.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
