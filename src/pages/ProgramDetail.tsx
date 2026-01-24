import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import DonationProgress from "@/components/shared/DonationProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgram } from "@/hooks/usePrograms";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Shield, 
  Sparkles, 
  Users, 
  Handshake, 
  MessageCircle, 
  Home as HomeIcon,
  Star,
  Send
} from "lucide-react";
import { z } from "zod";

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

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  inquiry_type: z.string().min(1, "Please select inquiry type"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: program, isLoading, error } = useProgram(slug || "");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry_type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const Icon = program ? iconMap[program.icon_name] || Star : Star;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!program) return;

    setIsSubmitting(true);

    const { error: submitError } = await supabase.from("program_inquiries").insert([
      {
        program_id: program.id,
        ...formData,
      },
    ]);

    if (submitError) {
      toast.error("Failed to submit inquiry. Please try again.");
    } else {
      toast.success("Inquiry submitted! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", inquiry_type: "", message: "" });
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !program) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">Program Not Found</h1>
            <Link to="/programs" className="text-primary hover:underline">
              ← Back to Programs
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const programImage = imageMap[program.slug];

  return (
    <Layout>
      {/* Hero */}
      <section className={`relative py-24 ${program.color}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Link
              to="/programs"
              className="inline-flex items-center text-background/80 hover:text-background mb-6 font-body"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-background/20 rounded-xl flex items-center justify-center">
                <Icon className="w-8 h-8 text-background" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-background">
                {program.title}
              </h1>
            </div>
            <p className="text-background/90 font-body text-lg max-w-2xl">
              {program.short_description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {programImage && (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={programImage}
                  alt={program.title}
                  className="w-full h-80 object-cover rounded-2xl mb-8"
                />
              )}

              <h2 className="font-display text-2xl font-bold text-foreground mb-4">About This Program</h2>
              <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8">
                {program.full_description || program.short_description}
              </p>

              {program.impact && (
                <div className="bg-muted p-6 rounded-xl mb-8">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">Our Impact</h3>
                  <p className="text-primary font-body font-medium">{program.impact}</p>
                </div>
              )}

              {/* Inquiry Form */}
              <div className="bg-card rounded-2xl p-8 shadow-card mt-12">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">
                  Interested in This Program?
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Your phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inquiry_type">Inquiry Type *</Label>
                      <Select
                        onValueChange={(v) => setFormData((prev) => ({ ...prev, inquiry_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volunteer">Volunteer for this program</SelectItem>
                          <SelectItem value="donate">Donate to this program</SelectItem>
                          <SelectItem value="partnership">Partnership opportunity</SelectItem>
                          <SelectItem value="information">Request more information</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.inquiry_type && (
                        <p className="text-sm text-destructive">{errors.inquiry_type}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help you?"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : (
                      <>
                        Send Inquiry
                        <Send className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Donation Progress */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">
                    Fundraising Progress
                  </h3>
                  <DonationProgress current={Number(program.raised)} goal={Number(program.goal)} />
                  <Link to="/donate" className="mt-6 block">
                    <Button className="w-full font-semibold">Donate to This Program</Button>
                  </Link>
                </div>

                {/* Quick Actions */}
                <div className="bg-muted rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">Get Involved</h3>
                  <div className="space-y-3">
                    <Link to="/volunteer">
                      <Button variant="outline" className="w-full justify-start">
                        <Heart className="w-4 h-4 mr-2" />
                        Become a Volunteer
                      </Button>
                    </Link>
                    <Link to="/partner">
                      <Button variant="outline" className="w-full justify-start">
                        <Handshake className="w-4 h-4 mr-2" />
                        Partner With Us
                      </Button>
                    </Link>
                    <Link to="/contact">
                      <Button variant="outline" className="w-full justify-start">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProgramDetail;
