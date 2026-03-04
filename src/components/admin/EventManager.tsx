import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  is_published: boolean;
  created_at: string;
}

interface EventManagerProps {
  onRefresh: () => void;
}

const EventManager = ({ onRefresh }: EventManagerProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    is_published: true,
  });

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });
    if (data) setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", event_date: "", location: "", is_published: true });
    setEditingEvent(null);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date.slice(0, 16),
      location: event.location || "",
      is_published: event.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date) {
      toast.error("Title and date are required");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      event_date: new Date(form.event_date).toISOString(),
      location: form.location || null,
      is_published: form.is_published,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", editingEvent.id);
      if (error) toast.error("Failed to update event");
      else toast.success("Event updated");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) toast.error("Failed to create event");
      else toast.success("Event created");
    }

    setDialogOpen(false);
    resetForm();
    fetchEvents();
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Event deleted");
      fetchEvents();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Events</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Date & Time *</Label>
                <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(c) => setForm({ ...form, is_published: c })} />
                <Label>Published</Label>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingEvent ? "Update" : "Create"} Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{format(new Date(event.event_date), "MMM dd, yyyy h:mm a")}</TableCell>
                  <TableCell>{event.location || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={event.is_published ? "default" : "secondary"}>
                      {event.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(event)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No events yet. Create your first event.
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

export default EventManager;
