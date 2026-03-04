import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

interface NewsletterManagerProps {
  onRefresh: () => void;
}

const NewsletterManager = ({ onRefresh }: NewsletterManagerProps) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const fetchSubscribers = async () => {
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSubscribers(data);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) toast.error("Failed to remove");
    else {
      toast.success("Subscriber removed");
      fetchSubscribers();
    }
  };

  const exportCSV = () => {
    const headers = ["Email", "Name", "Status", "Date"];
    const rows = subscribers.map((s) => [
      s.email,
      s.full_name || "",
      s.is_active ? "Active" : "Inactive",
      format(new Date(s.created_at), "yyyy-MM-dd"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          Newsletter Subscribers ({subscribers.length})
        </h2>
        <Button size="sm" variant="outline" onClick={exportCSV} disabled={!subscribers.length}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell>{sub.full_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={sub.is_active ? "default" : "secondary"}>
                      {sub.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(sub.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleRemove(sub.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {subscribers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No subscribers yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default NewsletterManager;
