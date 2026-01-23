import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Heart, 
  Gift, 
  Users, 
  BookOpen, 
  Shield, 
  Copy, 
  Check,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

const donationAmounts = [5000, 10000, 25000, 50000, 100000];

const impactAreas = [
  {
    icon: BookOpen,
    title: "Education",
    description: "Provide books, supplies, and learning materials",
    amount: "₦5,000 educates a child for a term",
  },
  {
    icon: Heart,
    title: "Health & Hygiene",
    description: "Distribute sanitary products and health education",
    amount: "₦3,000 provides 6 months of sanitary supplies",
  },
  {
    icon: Shield,
    title: "Child Protection",
    description: "Fund counselling services and safe spaces",
    amount: "₦10,000 supports a vulnerable child",
  },
  {
    icon: Users,
    title: "Community Programs",
    description: "Run workshops and cultural activities",
    amount: "₦25,000 sponsors a community event",
  },
];

const bankDetails = {
  bankName: "First Bank of Nigeria",
  accountName: "Raising the Hope of Rural Children Initiative",
  accountNumber: "0123456789", // Placeholder - to be updated
};

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25000);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("one-time");
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    toast.success("Account number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

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
              <Gift className="w-10 h-10 text-background" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Make a Donation
            </h1>
            <p className="text-background/90 font-body text-lg">
              Your generosity helps us provide education, health resources, and protection 
              to rural children across Nigeria. Every contribution makes a difference.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Areas */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Your Impact
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              See how your donation directly transforms the lives of rural children.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {impactAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <area.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {area.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm mb-4">
                  {area.description}
                </p>
                <p className="text-secondary font-body font-medium text-sm">
                  {area.amount}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl p-8 shadow-elevated"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                Choose Your Donation
              </h2>

              {/* Frequency Selection */}
              <div className="mb-8">
                <Label className="text-base font-semibold mb-4 block">
                  Donation Frequency
                </Label>
                <RadioGroup
                  value={frequency}
                  onValueChange={setFrequency}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one-time" id="one-time" />
                    <Label htmlFor="one-time" className="cursor-pointer">
                      One-time
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer">
                      Monthly
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Amount Selection */}
              <div className="mb-8">
                <Label className="text-base font-semibold mb-4 block">
                  Select Amount (₦)
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {donationAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`py-3 px-4 rounded-lg font-body font-medium transition-all ${
                        selectedAmount === amount
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Or enter a custom amount</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="text-lg"
                  />
                </div>
              </div>

              {/* Summary */}
              {finalAmount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-hope p-6 rounded-xl mb-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body text-muted-foreground">
                      Your {frequency === "monthly" ? "monthly" : ""} donation:
                    </span>
                    <span className="font-display text-3xl font-bold text-primary">
                      ₦{finalAmount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Bank Transfer Details */}
              <div className="border-t border-border pt-8">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Bank Transfer Details
                </h3>
                <p className="text-muted-foreground font-body text-sm mb-6">
                  Make your donation via bank transfer to the account below:
                </p>
                <div className="bg-muted rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-body">Bank Name:</span>
                    <span className="font-semibold text-foreground">{bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground font-body">Account Name:</span>
                    <span className="font-semibold text-foreground text-right max-w-xs">
                      {bankDetails.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-body">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-primary">
                        {bankDetails.accountNumber}
                      </span>
                      <button
                        onClick={handleCopyAccount}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="Copy account number"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-hope-green" />
                        ) : (
                          <Copy className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground font-body text-sm mt-6 text-center">
                  After making your transfer, please send a confirmation to{" "}
                  <a href="mailto:Info.rhrci@gmail.com" className="text-primary hover:underline">
                    Info.rhrci@gmail.com
                  </a>{" "}
                  with your name and donation amount.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
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
    </Layout>
  );
};

export default Donate;
