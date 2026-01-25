import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProgramCard from "@/components/programs/ProgramCard";
import { useRealtimeDonations } from "@/hooks/usePrograms";

import communityOutreach from "@/assets/community-outreach.jpg";
import culturalGames from "@/assets/cultural-games.jpg";
import distribution from "@/assets/distribution.jpg";

const imageMap: Record<string, string> = {
  "education-support": distribution,
  "menstrual-hygiene": communityOutreach,
  "cultural-development": culturalGames,
};

const Programs = () => {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const programs = useRealtimeDonations();

  return (
    <Layout>
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-24 bg-gradient-hope">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
              What We Do
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Programs
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Through comprehensive programs addressing education, health, rights, and culture, 
              we're creating lasting change in rural communities across Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index}
                image={imageMap[program.slug]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-background mb-4">
              Support Our Programs
            </h2>
            <p className="text-background/80 font-body text-lg mb-8 max-w-2xl mx-auto">
              Your contribution helps us expand these programs and reach more children in need.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center bg-background text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-background/90 transition-colors"
              >
                Donate Now
              </Link>
              <Link
                to="/volunteer"
                className="inline-flex items-center justify-center border-2 border-background text-background px-8 py-4 rounded-lg font-semibold hover:bg-background/10 transition-colors"
              >
                Become a Volunteer
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Programs;
