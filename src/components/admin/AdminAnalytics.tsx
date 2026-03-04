import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface Donation {
  amount: number;
  created_at: string;
  payment_status: string;
}

interface AdminAnalyticsProps {
  donations: Donation[];
  contacts: { created_at: string }[];
  volunteers: { created_at: string }[];
  partners: { created_at: string }[];
}

const AdminAnalytics = ({ donations, contacts, volunteers, partners }: AdminAnalyticsProps) => {
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const label = format(date, "MMM yy");

      const monthDonations = donations.filter(
        (d) => d.payment_status === "completed" && isWithinInterval(new Date(d.created_at), { start, end })
      );
      const monthContacts = contacts.filter((c) => isWithinInterval(new Date(c.created_at), { start, end }));
      const monthVolunteers = volunteers.filter((v) => isWithinInterval(new Date(v.created_at), { start, end }));

      return {
        month: label,
        donations: monthDonations.reduce((sum, d) => sum + Number(d.amount), 0),
        donationCount: monthDonations.length,
        contacts: monthContacts.length,
        volunteers: monthVolunteers.length,
      };
    });
    return months;
  }, [donations, contacts, volunteers, partners]);

  const exportAllCSV = (type: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === "donations") {
      headers = ["Donor", "Email", "Amount", "Status", "Date"];
      rows = (donations as any[]).map((d) => [
        d.donor_name || "Anonymous",
        d.donor_email || "",
        String(d.amount),
        d.payment_status,
        format(new Date(d.created_at), "yyyy-MM-dd"),
      ]);
    }

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Donation Trends Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-foreground">Donation Trends (6 Months)</h3>
          <Button size="sm" variant="outline" onClick={() => exportAllCSV("donations")}>
            <Download className="w-4 h-4 mr-1" /> Export Donations
          </Button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`₦${value.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
              />
              <Bar dataKey="donations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submissions Trends */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">
          Submissions Trends (6 Months)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="contacts" stroke="hsl(var(--secondary))" strokeWidth={2} name="Contacts" />
              <Line type="monotone" dataKey="volunteers" stroke="hsl(var(--primary))" strokeWidth={2} name="Volunteers" />
              <Line type="monotone" dataKey="donationCount" stroke="hsl(var(--accent))" strokeWidth={2} name="Donations" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
