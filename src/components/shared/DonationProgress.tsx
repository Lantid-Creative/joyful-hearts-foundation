import { motion } from "framer-motion";

interface DonationProgressProps {
  current: number;
  goal: number;
  label?: string;
  compact?: boolean;
}

const DonationProgress = ({ current, goal, label, compact = false }: DonationProgressProps) => {
  const percentage = Math.min((current / goal) * 100, 100);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {label && (
        <p className="text-muted-foreground font-body text-sm">{label}</p>
      )}
      
      {/* Progress Bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-warm rounded-full"
        />
      </div>

      {/* Stats */}
      <div className={`flex justify-between items-center ${compact ? "text-xs" : "text-sm"}`}>
        <span className="font-body text-foreground font-semibold">
          {formatCurrency(current)} raised
        </span>
        <span className="font-body text-muted-foreground">
          of {formatCurrency(goal)} goal
        </span>
      </div>

      {/* Percentage Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {percentage.toFixed(0)}% funded
        </span>
      </div>
    </div>
  );
};

export default DonationProgress;
