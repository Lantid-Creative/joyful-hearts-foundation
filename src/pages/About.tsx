import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Target, Eye, Heart, Users, Award, Globe } from "lucide-react";
import girlReading from "@/assets/girl-reading.jpg";

const aims = [
  "To promote the education and personal development of rural children.",
  "To protect the rights and dignity of the rural child, especially the girl child.",
  "To foster interaction and integration between rural and urban children.",
  "To promote menstrual hygiene awareness and gender equity.",
  "To preserve and inculcate positive cultural values and ethics in rural communities.",
];

const objectives = [
  "To distribute learning materials and educational resources to rural children and schools.",
  "To create mentorship and exchange platforms between rural and urban school children.",
  "To conduct menstrual hygiene education and distribute sanitary products to girls in rural areas.",
  "To organize awareness campaigns against early marriage and teenage pregnancy.",
  "To promote children's rights education in rural communities through workshops and outreach programs.",
  "To establish cultural and moral development programs such as storytelling, traditional games, and value-based leadership clubs.",
  "To engage community leaders, parents, and traditional institutions in promoting child-friendly and protective environments.",
  "To train volunteers, teachers, and caregivers on child development, rights protection, and inclusive practices.",
  "To collaborate with government agencies, NGOs, schools, and faith-based organizations for sustainable rural child development.",
  "To advocate for policies and initiatives that support education, health, and protection of the rural child.",
  "To protect vulnerable children by offering counselling sessions and building a home to accommodate orphans, victims of abuse and trauma, and pregnant teenagers amongst others.",
];

const values = [
  { icon: Heart, title: "Compassion", description: "We approach every child with love and empathy." },
  { icon: Users, title: "Inclusivity", description: "Every child deserves equal opportunities regardless of location." },
  { icon: Award, title: "Integrity", description: "We operate with transparency and accountability." },
  { icon: Globe, title: "Cultural Pride", description: "We celebrate and preserve our rich heritage." },
];

const About = () => {
  const missionRef = useRef(null);
  const aimsRef = useRef(null);
  const objectivesRef = useRef(null);
  const valuesRef = useRef(null);
  const convenerRef = useRef(null);

  const isMissionInView = useInView(missionRef, { once: true, margin: "-100px" });
  const isAimsInView = useInView(aimsRef, { once: true, margin: "-100px" });
  const isObjectivesInView = useInView(objectivesRef, { once: true, margin: "-100px" });
  const isValuesInView = useInView(valuesRef, { once: true, margin: "-100px" });
  const isConvenerInView = useInView(convenerRef, { once: true, margin: "-100px" });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-hope">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
              About Us
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Story & Mission
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Learn about who we are, what drives us, and how we're making a difference 
              in the lives of rural children across Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section ref={missionRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isMissionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <img
                src={girlReading}
                alt="Child reading"
                className="rounded-2xl shadow-elevated w-full"
              />
            </motion.div>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isMissionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card p-8 rounded-2xl shadow-card"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Our Mission
                  </h2>
                </div>
                <p className="text-muted-foreground font-body leading-relaxed">
                  To empower rural children by bridging the gap between them and their urban counterparts 
                  through access to quality education, health awareness, cultural values, and rights advocacy, 
                  ensuring they are equipped to thrive in a modern world while preserving their heritage.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isMissionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-card p-8 rounded-2xl shadow-card"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Our Vision
                  </h2>
                </div>
                <p className="text-muted-foreground font-body leading-relaxed">
                  A Nigeria where every rural child is informed, empowered, and confident, 
                  with equal access to opportunities, health, dignity, and cultural identity.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Aims */}
      <section ref={aimsRef} className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isAimsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Aims
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              These core aims guide everything we do as an organization.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {aims.map((aim, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isAimsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <p className="text-foreground font-body">{aim}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section ref={objectivesRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isObjectivesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Objectives
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Specific, actionable goals that bring our mission to life.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {objectives.map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={isObjectivesInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-semibold text-xs">
                  {index + 1}
                </span>
                <p className="text-muted-foreground font-body text-sm">{objective}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section ref={valuesRef} className="py-20 bg-gradient-hope">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isValuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isValuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-card text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Convener */}
      <section ref={convenerRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isConvenerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-secondary font-semibold font-body text-sm uppercase tracking-wider mb-2 block">
              Leadership
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Meet Our Convener
            </h2>
            <div className="bg-card p-8 rounded-2xl shadow-card">
              <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-background font-display text-3xl font-bold">JO</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                Joy Ifeyinwa Okoli Esq.
              </h3>
              <p className="text-secondary font-body font-medium mb-4">Convener</p>
              <p className="text-muted-foreground font-body max-w-xl mx-auto">
                A passionate advocate for children's rights and rural development, 
                leading the initiative with dedication to transforming lives and 
                bridging the gap between rural and urban opportunities.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
