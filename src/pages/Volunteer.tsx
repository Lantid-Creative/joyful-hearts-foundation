import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Users, Calendar, MapPin, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { checkRateLimit, formatRetryTime } from "@/hooks/useRateLimit";

const volunteerSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Invalid phone number").max(20),
  location: z.string().trim().max(200).optional(),
  occupation: z.string().trim().max(100).optional(),
  availability: z.string().optional(),
  skills: z.string().trim().max(500).optional(),
  motivation: z.string().trim().max(1000).optional(),
  how_heard: z.string().optional(),
});

const benefits = [
  { icon: Heart, text: "Make a real difference in children's lives" },
  { icon: Users, text: "Join a passionate community of changemakers" },
  { icon: Calendar, text: "Flexible schedules to fit your lifestyle" },
  { icon: MapPin, text: "Work in rural communities across Nigeria" },
  { icon: Sparkles, text: "Develop new skills and experiences" },
];

const Volunteer = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    occupation: "",
    availability: "",
    skills: "",
    motivation: "",
    how_heard: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = volunteerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const rateCheck = checkRateLimit("volunteer");
    if (!rateCheck.allowed) {
      toast.error(`Too many applications submitted. Please try again in ${formatRetryTime(rateCheck.retryAfterMs)}.`);
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("volunteer_applications").insert([formData]);

    if (error) {
      toast.error("Failed to submit application. Please try again.");
    } else {
      setIsSuccess(true);
      toast.success("Application submitted successfully!");
      // Fire-and-forget admin notification
      supabase.functions.invoke("send-notification-email", {
        body: { type: "volunteer", data: formData },
      }).catch(console.error);
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <Layout>
        <section className="py-32 bg-gradient-hope">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center bg-card rounded-2xl p-10 shadow-elevated"
            >
              <CheckCircle className="w-20 h-20 text-hope-green mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Thank You!
              </h1>
              <p className="text-muted-foreground font-body mb-8">
                Your volunteer application has been submitted successfully. Our team will review your
                application and get back to you within 5-7 business days.
              </p>
              <Button asChild>
                <a href="/">Return to Home</a>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-hero text-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-20 h-20 bg-background/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-background" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Become a Volunteer
            </h1>
            <p className="text-background/90 font-body text-lg">
              Join our team of dedicated volunteers and make a real difference in the lives of rural
              children across Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-body text-muted-foreground">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-card rounded-2xl p-8 shadow-elevated">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
                Volunteer Application Form
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Your full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                    {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
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
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      placeholder="Your current occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select onValueChange={(v) => handleSelectChange("availability", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends Only</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="remote">Remote Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills & Expertise</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    placeholder="What skills can you bring? (e.g., teaching, counseling, event planning...)"
                    rows={3}
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to volunteer with RHRCI?</Label>
                  <Textarea
                    id="motivation"
                    name="motivation"
                    placeholder="Tell us about your motivation..."
                    rows={4}
                    value={formData.motivation}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="how_heard">How did you hear about us?</Label>
                  <Select onValueChange={(v) => handleSelectChange("how_heard", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="friend">Friend or Family</SelectItem>
                      <SelectItem value="event">Community Event</SelectItem>
                      <SelectItem value="website">Website Search</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Volunteer;
