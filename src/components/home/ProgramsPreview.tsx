import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DonationProgress from "@/components/shared/DonationProgress";

const programs = [
  {
    icon: BookOpen,
    title: "Education Support",
    description:
      "Distributing learning materials and educational resources to rural children and schools, creating mentorship platforms between rural and urban students.",
    color: "text-primary",
    bgColor: "bg-hope-green-light",
    raised: 0,
    goal: 500000,
  },
  {
    icon: Heart,
    title: "Health & Hygiene",
    description:
      "Conducting menstrual hygiene education and distributing sanitary products to girls in rural areas, promoting health awareness.",
    color: "text-secondary",
    bgColor: "bg-warmth-orange-light",
    raised: 0,
    goal: 300000,
  },
  {
    icon: Shield,
    title: "Rights Advocacy",
    description:
      "Organizing awareness campaigns against early marriage and teenage pregnancy, promoting children's rights education through workshops.",
    color: "text-accent",
    bgColor: "bg-sky-blue-light",
    raised: 0,
    goal: 250000,
  },
  {
    icon: Users,
    title: "Cultural Preservation",
    description:
      "Establishing cultural and moral development programs including storytelling, traditional games, and value-based leadership clubs.",
    color: "text-earth-brown",
    bgColor: "bg-cream-dark",
    raised: 0,
    goal: 200000,
  },
];

const ProgramsPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
            What We Do
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Core Programs
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Through our comprehensive programs, we address the diverse needs of 
            rural children and their communities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <div
                className={`w-12 h-12 ${program.bgColor} rounded-xl flex items-center justify-center mb-5`}
              >
                <program.icon className={`w-6 h-6 ${program.color}`} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                {program.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4 flex-1">
                {program.description}
              </p>
              
              {/* Donation Progress */}
              <div className="pt-4 border-t border-border">
                <DonationProgress
                  current={program.raised}
                  goal={program.goal}
                  compact
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Link to="/programs">
            <Button variant="outline" size="lg" className="font-semibold">
              View All Programs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProgramsPreview;
