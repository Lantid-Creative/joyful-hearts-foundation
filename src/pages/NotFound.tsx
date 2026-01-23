import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto"
          >
            <div className="text-9xl font-display font-bold text-gradient-hero mb-6">
              404
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground font-body text-lg mb-8">
              Oops! The page you're looking for seems to have wandered off. 
              Let's get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="font-semibold">
                  <Home className="mr-2 w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.history.back()}
                className="font-semibold"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Go Back
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
