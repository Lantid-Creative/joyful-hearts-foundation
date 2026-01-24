import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DonationProgress from "@/components/shared/DonationProgress";
import { Button } from "@/components/ui/button";
import { useRealtimeDonations } from "@/hooks/usePrograms";
import { 
  BookOpen, 
  Heart, 
  Shield, 
  Users, 
  Sparkles, 
  Home as HomeIcon,
  MessageCircle,
  Handshake,
  Star,
  ArrowRight
} from "lucide-react";
import communityOutreach from "@/assets/community-outreach.jpg";
import culturalGames from "@/assets/cultural-games.jpg";
import distribution from "@/assets/distribution.jpg";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Heart,
  Shield,
  Sparkles,
  Users,
  Handshake,
  MessageCircle,
  Home: HomeIcon,
  Star,
};

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
            {programs.map((program, index) => {
              const ref = useRef(null);
              const isInView = useInView(ref, { once: true, margin: "-100px" });
              const isEven = index % 2 === 0;
              const Icon = iconMap[program.icon_name] || Star;
              const programImage = imageMap[program.slug];

              return (
                <motion.div
                  key={program.id}
                  ref={ref}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    !isEven && programImage ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={programImage && !isEven ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 ${program.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-background" />
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                        {program.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground font-body text-lg leading-relaxed mb-6">
                      {program.short_description}
                    </p>
                    {program.impact && (
                      <div className="bg-muted p-4 rounded-lg mb-6">
                        <p className="text-primary font-body font-medium">
                          <span className="font-semibold">Impact: </span>
                          {program.impact}
                        </p>
                      </div>
                    )}
                    
                    {/* Donation Progress */}
                    <div className="bg-card p-6 rounded-xl shadow-card">
                      <h4 className="font-display text-lg font-semibold text-foreground mb-4">
                        Fundraising Progress
                      </h4>
                      <DonationProgress
                        current={Number(program.raised)}
                        goal={Number(program.goal)}
                      />
                      <div className="flex gap-3 mt-4">
                        <Link to={`/programs/${program.slug}`} className="flex-1">
                          <Button variant="outline" className="w-full font-semibold">
                            Learn More
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to="/donate" className="flex-1">
                          <Button className="w-full font-semibold">
                            Support This Program
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  {programImage ? (
                    <div className={!isEven ? "lg:order-1" : ""}>
                      <Link to={`/programs/${program.slug}`}>
                        <img
                          src={programImage}
                          alt={program.title}
                          className="rounded-2xl shadow-elevated w-full h-96 object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                        />
                      </Link>
                    </div>
                  ) : (
                    <Link to={`/programs/${program.slug}`} className={`${program.color} rounded-2xl h-96 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer ${!isEven ? "lg:order-1" : ""}`}>
                      <Icon className="w-24 h-24 text-background/30" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
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
