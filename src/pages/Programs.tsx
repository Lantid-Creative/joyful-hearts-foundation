import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DonationProgress from "@/components/shared/DonationProgress";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Heart, 
  Shield, 
  Users, 
  Sparkles, 
  Home as HomeIcon,
  MessageCircle,
  Handshake 
} from "lucide-react";
import communityOutreach from "@/assets/community-outreach.jpg";
import culturalGames from "@/assets/cultural-games.jpg";
import distribution from "@/assets/distribution.jpg";

const programs = [
  {
    icon: BookOpen,
    title: "Education Support & Resources",
    description: "We distribute learning materials and educational resources to rural children and schools. Our mentorship programs create platforms for interaction between rural and urban school children, fostering knowledge exchange and mutual understanding.",
    impact: "Providing books, school supplies, and educational materials to hundreds of children",
    image: distribution,
    color: "bg-primary",
    raised: 125000,
    goal: 500000,
  },
  {
    icon: Heart,
    title: "Menstrual Hygiene & Health Awareness",
    description: "We conduct comprehensive menstrual hygiene education and distribute sanitary products to girls in rural areas. This program promotes gender equity and ensures girls can attend school with dignity.",
    impact: "Breaking taboos and ensuring girls never miss school due to menstruation",
    image: communityOutreach,
    color: "bg-secondary",
    raised: 85000,
    goal: 300000,
  },
  {
    icon: Shield,
    title: "Children's Rights Advocacy",
    description: "Through workshops and outreach programs, we promote children's rights education in rural communities. We organize awareness campaigns against early marriage and teenage pregnancy.",
    impact: "Protecting children's futures through education and community engagement",
    image: null,
    color: "bg-accent",
    raised: 45000,
    goal: 250000,
  },
  {
    icon: Sparkles,
    title: "Cultural & Moral Development",
    description: "We establish cultural programs including storytelling, traditional games, and value-based leadership clubs. These initiatives preserve heritage while developing character.",
    impact: "Celebrating culture while building tomorrow's leaders",
    image: culturalGames,
    color: "bg-earth-brown",
    raised: 60000,
    goal: 200000,
  },
  {
    icon: Users,
    title: "Community Engagement",
    description: "We engage community leaders, parents, and traditional institutions in promoting child-friendly and protective environments. Training is provided for volunteers, teachers, and caregivers.",
    impact: "Building protective communities around every child",
    image: null,
    color: "bg-hope-green",
    raised: 35000,
    goal: 150000,
  },
  {
    icon: Handshake,
    title: "Partnerships & Collaboration",
    description: "We collaborate with government agencies, NGOs, schools, and faith-based organizations for sustainable rural child development. Together, we advocate for supportive policies.",
    impact: "Creating lasting change through strategic partnerships",
    image: null,
    color: "bg-sky-blue",
    raised: 20000,
    goal: 100000,
  },
  {
    icon: MessageCircle,
    title: "Counselling Services",
    description: "We offer counselling sessions to protect vulnerable children, addressing trauma and providing emotional support to those in need.",
    impact: "Healing hearts and nurturing emotional wellbeing",
    image: null,
    color: "bg-sun-yellow",
    raised: 40000,
    goal: 180000,
  },
  {
    icon: HomeIcon,
    title: "Safe Haven Project",
    description: "We are working towards building a home to accommodate orphans, victims of abuse and trauma, and pregnant teenagers, providing them with safety, care, and opportunities.",
    impact: "Creating a sanctuary for the most vulnerable children",
    image: null,
    color: "bg-heart-red",
    raised: 150000,
    goal: 2000000,
  },
];

const Programs = () => {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

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

              return (
                <motion.div
                  key={program.title}
                  ref={ref}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    !isEven && program.image ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={program.image && !isEven ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 ${program.color} rounded-xl flex items-center justify-center`}>
                        <program.icon className="w-7 h-7 text-background" />
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                        {program.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground font-body text-lg leading-relaxed mb-6">
                      {program.description}
                    </p>
                    <div className="bg-muted p-4 rounded-lg mb-6">
                      <p className="text-primary font-body font-medium">
                        <span className="font-semibold">Impact: </span>
                        {program.impact}
                      </p>
                    </div>
                    
                    {/* Donation Progress */}
                    <div className="bg-card p-6 rounded-xl shadow-card">
                      <h4 className="font-display text-lg font-semibold text-foreground mb-4">
                        Fundraising Progress
                      </h4>
                      <DonationProgress
                        current={program.raised}
                        goal={program.goal}
                      />
                      <Link to="/donate" className="mt-4 block">
                        <Button className="w-full font-semibold">
                          Support This Program
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Image */}
                  {program.image ? (
                    <div className={!isEven ? "lg:order-1" : ""}>
                      <img
                        src={program.image}
                        alt={program.title}
                        className="rounded-2xl shadow-elevated w-full h-96 object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`${program.color} rounded-2xl h-96 flex items-center justify-center ${!isEven ? "lg:order-1" : ""}`}>
                      <program.icon className="w-24 h-24 text-background/30" />
                    </div>
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
            <Link
              to="/donate"
              className="inline-flex items-center justify-center bg-background text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-background/90 transition-colors"
            >
              Donate Now
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Programs;
