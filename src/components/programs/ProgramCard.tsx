import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import DonationProgress from "@/components/shared/DonationProgress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Program } from "@/hooks/usePrograms";
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
} from "lucide-react";

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

interface ProgramCardProps {
  program: Program;
  index: number;
  image?: string;
}

const ProgramCard = ({ program, index, image }: ProgramCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;
  const Icon = iconMap[program.icon_name] || Star;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`grid lg:grid-cols-2 gap-12 items-center`}
    >
      {/* Content */}
      <div className={image && !isEven ? "lg:order-2" : ""}>
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
      {image ? (
        <div className={!isEven ? "lg:order-1" : ""}>
          <Link to={`/programs/${program.slug}`}>
            <img
              src={image}
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
};

export default ProgramCard;
