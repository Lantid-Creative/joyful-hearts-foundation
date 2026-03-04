import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } else {
      toast.success("Thank you for subscribing!");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="bg-primary/10 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-3">
        <Mail className="w-6 h-6 text-primary" />
        <h4 className="font-display text-lg font-semibold text-foreground">Stay Updated</h4>
      </div>
      <p className="text-muted-foreground text-sm font-body mb-4">
        Subscribe to our newsletter for updates on our programs and impact stories.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
};

export default NewsletterSignup;
