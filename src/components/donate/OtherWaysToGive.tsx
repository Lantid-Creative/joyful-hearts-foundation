import { motion } from "framer-motion";
import { Heart, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const OtherWaysToGive = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Other Ways to Give
          </h2>
          <p className="text-muted-foreground font-body text-lg mb-8">
            Beyond monetary donations, there are many ways you can support our mission.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-xl shadow-card">
              <Heart className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Donate Supplies
              </h3>
              <p className="text-muted-foreground font-body text-sm">
                Books, school supplies, sanitary products, and other materials are always welcome.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-card">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Volunteer Time
              </h3>
              <p className="text-muted-foreground font-body text-sm">
                Share your skills and time with rural communities as a volunteer.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-card">
              <Gift className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Corporate Sponsorship
              </h3>
              <p className="text-muted-foreground font-body text-sm">
                Partner with us as a corporate sponsor to make a larger impact.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Button size="lg" variant="outline" className="font-semibold" asChild>
              <a href="/contact">Contact Us to Discuss</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OtherWaysToGive;
