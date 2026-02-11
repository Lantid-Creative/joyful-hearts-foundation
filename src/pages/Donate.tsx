import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Gift, 
  Users, 
  BookOpen, 
  Shield, 
  Copy, 
  Check,
  CreditCard,
  Wallet,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ImpactAreas from "@/components/donate/ImpactAreas";
import OtherWaysToGive from "@/components/donate/OtherWaysToGive";

const donationAmounts = [5000, 10000, 25000, 50000, 100000];

const bankDetails = {
  bankName: "Sun Trust Bank",
  accountName: "Raising the Hope of Rural Children Initiative",
  accountNumber: "0026104602",
};

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25000);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("one-time");
  const [copied, setCopied] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePaystackPayment = async () => {
    if (!finalAmount || finalAmount < 100) {
      toast.error("Please select or enter a valid donation amount (minimum ₦100)");
      return;
    }
    if (!donorEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("initialize-payment", {
        body: {
          amount: finalAmount,
          email: donorEmail,
          name: donorName,
          phone: donorPhone,
        },
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Store reference for verification on return
        localStorage.setItem("paystack_ref", data.reference);
        window.location.href = data.authorization_url;
      } else {
        toast.error("Could not initialize payment. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment initialization failed. Please try bank transfer instead.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const ref = localStorage.getItem("paystack_ref");
    const urlParams = new URLSearchParams(window.location.search);
    const trxref = urlParams.get("trxref") || urlParams.get("reference");

    if (ref || trxref) {
      const reference = trxref || ref;
      localStorage.removeItem("paystack_ref");

      supabase.functions
        .invoke("verify-payment", { body: { reference } })
        .then(({ data }) => {
          if (data?.status === "success") {
            toast.success("Thank you! Your donation has been received successfully! 🎉");
          } else {
            toast.error("Payment could not be verified. Please contact us if you were charged.");
          }
        });

      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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
      <ImpactAreas />

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

              {/* Payment Methods */}
              <Tabs defaultValue="online" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="online" className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Pay Online
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Bank Transfer
                  </TabsTrigger>
                </TabsList>

                {/* Online Payment Tab */}
                <TabsContent value="online">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="donor-name">Full Name</Label>
                        <Input
                          id="donor-name"
                          placeholder="Your full name"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor-email">Email Address *</Label>
                        <Input
                          id="donor-email"
                          type="email"
                          placeholder="your@email.com"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donor-phone">Phone Number (optional)</Label>
                      <Input
                        id="donor-phone"
                        type="tel"
                        placeholder="+234..."
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handlePaystackPayment}
                      disabled={isProcessing || !finalAmount}
                      size="lg"
                      className="w-full font-semibold text-lg py-6"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Donate {finalAmount ? `₦${finalAmount.toLocaleString()}` : ""} Now
                        </>
                      )}
                    </Button>
                    <p className="text-muted-foreground font-body text-xs text-center">
                      Secured by Paystack. You'll be redirected to complete payment.
                    </p>
                  </div>
                </TabsContent>

                {/* Bank Transfer Tab */}
                <TabsContent value="bank">
                  <div>
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
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <OtherWaysToGive />
    </Layout>
  );
};

export default Donate;
