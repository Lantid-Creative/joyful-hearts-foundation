import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, Building2, Users, Target, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const partnerSchema = z.object({
  organization_name: z.string().trim().min(2, "Organization name required").max(200),
  contact_person: z.string().trim().min(2, "Contact person required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(20).optional(),
  organization_type: z.string().optional(),
  website: z.string().trim().max(255).optional(),
  partnership_type: z.string().optional(),
  message: z.string().trim().max(2000).optional(),
});

const partnershipTypes = [
  { value: "corporate_sponsorship", label: "Corporate Sponsorship" },
  { value: "program_collaboration", label: "Program Collaboration" },
  { value: "resource_sharing", label: "Resource Sharing" },
  { value: "capacity_building", label: "Capacity Building" },
  { value: "advocacy", label: "Joint Advocacy" },
  { value: "other", label: "Other" },
];

const organizationTypes = [
  { value: "corporate", label: "Corporate/Business" },
  { value: "ngo", label: "NGO/Non-Profit" },
  { value: "government", label: "Government Agency" },
  { value: "educational", label: "Educational Institution" },
  { value: "faith_based", label: "Faith-Based Organization" },
  { value: "foundation", label: "Foundation" },
  { value: "other", label: "Other" },
];

const Partner = () => {
  const [formData, setFormData] = useState({
    organization_name: "",
    contact_person: "",
    email: "",
    phone: "",
    organization_type: "",
    website: "",
    partnership_type: "",
    message: "",
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

    const result = partnerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("partner_requests").insert([formData]);

    if (error) {
      toast.error("Failed to submit request. Please try again.");
    } else {
      setIsSuccess(true);
      toast.success("Partnership request submitted successfully!");
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
                Request Received!
              </h1>
              <p className="text-muted-foreground font-body mb-8">
                Thank you for your interest in partnering with RHRCI. Our team will review your
                request and get back to you within 7-10 business days.
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
              <Handshake className="w-10 h-10 text-background" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Partner With Us
            </h1>
            <p className="text-background/90 font-body text-lg">
              Together, we can create sustainable impact for rural children. Explore partnership
              opportunities with RHRCI.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Expand Your Impact
              </h3>
              <p className="text-muted-foreground font-body text-sm">
                Leverage our grassroots network to create meaningful social impact in rural communities.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Skilled Team
              </h3>
              <p className="text-muted-foreground font-body text-sm">
                Work with dedicated professionals and volunteers committed to child welfare.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Clear Goals
              </h3>
              <p className="text-muted-foreground font-body text-sm">
                Transparent reporting and measurable outcomes for every partnership.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partnership Form */}
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
                Partnership Inquiry Form
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization_name">Organization Name *</Label>
                    <Input
                      id="organization_name"
                      name="organization_name"
                      placeholder="Your organization"
                      value={formData.organization_name}
                      onChange={handleChange}
                      required
                    />
                    {errors.organization_name && (
                      <p className="text-sm text-destructive">{errors.organization_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person *</Label>
                    <Input
                      id="contact_person"
                      name="contact_person"
                      placeholder="Your name"
                      value={formData.contact_person}
                      onChange={handleChange}
                      required
                    />
                    {errors.contact_person && (
                      <p className="text-sm text-destructive">{errors.contact_person}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@organization.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization_type">Organization Type</Label>
                    <Select onValueChange={(v) => handleSelectChange("organization_type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnership_type">Type of Partnership</Label>
                  <Select onValueChange={(v) => handleSelectChange("partnership_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select partnership type" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnershipTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell us about your partnership goals</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Describe how you'd like to partner with RHRCI..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Partnership Request"}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Partner;
