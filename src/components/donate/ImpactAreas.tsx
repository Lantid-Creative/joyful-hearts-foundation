import { motion } from "framer-motion";
import { BookOpen, Heart, Shield, Users } from "lucide-react";

const impactAreas = [
  {
    icon: BookOpen,
    title: "Education",
    description: "Provide books, supplies, and learning materials",
    amount: "₦5,000 educates a child for a term",
  },
  {
    icon: Heart,
    title: "Health & Hygiene",
    description: "Distribute sanitary products and health education",
    amount: "₦3,000 provides 6 months of sanitary supplies",
  },
  {
    icon: Shield,
    title: "Child Protection",
    description: "Fund counselling services and safe spaces",
    amount: "₦10,000 supports a vulnerable child",
  },
  {
    icon: Users,
    title: "Community Programs",
    description: "Run workshops and cultural activities",
    amount: "₦25,000 sponsors a community event",
  },
];

const ImpactAreas = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Your Impact
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            See how your donation directly transforms the lives of rural children.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactAreas.map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card text-center"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <area.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {area.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm mb-4">
                {area.description}
              </p>
              <p className="text-secondary font-body font-medium text-sm">
                {area.amount}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactAreas;
