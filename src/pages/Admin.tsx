import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutDashboard,
  Users,
  Handshake,
  MessageSquare,
  Gift,
  BookOpen,
  LogOut,
  Menu,
  X,
  Eye,
  CheckCircle,
  Search,
  RefreshCw,
  FileText,
  Image,
  Shield,
} from "lucide-react";
import logo from "@/assets/rhrci-logo.jpeg";
import BlogManager from "@/components/admin/BlogManager";
import GalleryManager from "@/components/admin/GalleryManager";
import UserRoleManager from "@/components/admin/UserRoleManager";

interface Donation {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  is_anonymous: boolean;
  payment_status: string;
  created_at: string;
  programs?: { title: string } | null;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface VolunteerApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  is_reviewed: boolean;
  created_at: string;
}

interface PartnerRequest {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string;
  status: string;
  is_reviewed: boolean;
  created_at: string;
}

interface ProgramInquiry {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  programs?: { title: string } | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_name: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface GalleryMedia {
  id: string;
  type: string;
  url: string;
  thumbnail_url: string | null;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [donations, setDonations] = useState<Donation[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [partners, setPartners] = useState<PartnerRequest[]>([]);
  const [inquiries, setInquiries] = useState<ProgramInquiry[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMedia[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalContacts: 0,
    totalVolunteers: 0,
    totalPartners: 0,
    unreadContacts: 0,
    pendingVolunteers: 0,
    totalBlogPosts: 0,
    totalMedia: 0,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const fetchData = async () => {
    setRefreshing(true);

    // Fetch all data in parallel
    const [donationsRes, contactsRes, volunteersRes, partnersRes, inquiriesRes, blogRes, galleryRes] = await Promise.all([
      supabase.from("donations").select("*, programs(title)").order("created_at", { ascending: false }),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("partner_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("program_inquiries").select("*, programs(title)").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("gallery_media").select("*").order("display_order", { ascending: true }),
    ]);

    if (donationsRes.data) setDonations(donationsRes.data);
    if (contactsRes.data) setContacts(contactsRes.data);
    if (volunteersRes.data) setVolunteers(volunteersRes.data);
    if (partnersRes.data) setPartners(partnersRes.data);
    if (inquiriesRes.data) setInquiries(inquiriesRes.data);
    if (blogRes.data) setBlogPosts(blogRes.data);
    if (galleryRes.data) setGalleryMedia(galleryRes.data);

    // Calculate stats
    setStats({
      totalDonations: donationsRes.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0,
      totalContacts: contactsRes.data?.length || 0,
      totalVolunteers: volunteersRes.data?.length || 0,
      totalPartners: partnersRes.data?.length || 0,
      unreadContacts: contactsRes.data?.filter((c) => !c.is_read).length || 0,
      pendingVolunteers: volunteersRes.data?.filter((v) => v.status === "pending").length || 0,
      totalBlogPosts: blogRes.data?.length || 0,
      totalMedia: galleryRes.data?.length || 0,
    });

    setRefreshing(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const markContactAsRead = async (id: string) => {
    await supabase.from("contact_submissions").update({ is_read: true }).eq("id", id);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, is_read: true } : c)));
  };

  const updateVolunteerStatus = async (id: string, status: string) => {
    await supabase.from("volunteer_applications").update({ status, is_reviewed: true }).eq("id", id);
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status, is_reviewed: true } : v))
    );
  };

  const updatePartnerStatus = async (id: string, status: string) => {
    await supabase.from("partner_requests").update({ status, is_reviewed: true }).eq("id", id);
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status, is_reviewed: true } : p)));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="bg-card rounded-2xl p-8 shadow-elevated max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Please contact the administrator if you believe this is an error.
          </p>
          <div className="space-y-3">
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
            <Button asChild className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "blog", label: "Blog Posts", icon: FileText },
    { id: "gallery", label: "Gallery Media", icon: Image },
    { id: "users", label: "User Roles", icon: Shield },
    { id: "donations", label: "Donations", icon: Gift },
    { id: "contacts", label: "Contact Messages", icon: MessageSquare },
    { id: "volunteers", label: "Volunteer Applications", icon: Users },
    { id: "partners", label: "Partner Requests", icon: Handshake },
    { id: "inquiries", label: "Program Inquiries", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="RHRCI" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">RHRCI Admin</h2>
                <p className="text-xs text-muted-foreground">Management Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-display text-xl font-bold text-foreground">
              {sidebarItems.find((i) => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-body">Total Donations</p>
                      <p className="font-display text-2xl font-bold text-foreground">
                        {formatCurrency(stats.totalDonations)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-body">Contact Messages</p>
                      <p className="font-display text-2xl font-bold text-foreground">
                        {stats.totalContacts}
                        {stats.unreadContacts > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {stats.unreadContacts} new
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-hope-green/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-hope-green" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-body">Volunteer Apps</p>
                      <p className="font-display text-2xl font-bold text-foreground">
                        {stats.totalVolunteers}
                        {stats.pendingVolunteers > 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {stats.pendingVolunteers} pending
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Handshake className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-body">Partner Requests</p>
                      <p className="font-display text-2xl font-bold text-foreground">
                        {stats.totalPartners}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">
                    Recent Donations
                  </h3>
                  <div className="space-y-4">
                    {donations.slice(0, 5).map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-body font-medium text-foreground">
                            {donation.is_anonymous ? "Anonymous" : donation.donor_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(donation.created_at)}
                          </p>
                        </div>
                        <p className="font-display font-bold text-primary">
                          {formatCurrency(Number(donation.amount))}
                        </p>
                      </div>
                    ))}
                    {donations.length === 0 && (
                      <p className="text-muted-foreground text-sm">No donations yet</p>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-card">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">
                    Recent Messages
                  </h3>
                  <div className="space-y-4">
                    {contacts.slice(0, 5).map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-body font-medium text-foreground">{contact.name}</p>
                            {!contact.is_read && (
                              <Badge variant="secondary" className="text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {contact.subject}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(contact.created_at)}
                        </p>
                      </div>
                    ))}
                    {contacts.length === 0 && (
                      <p className="text-muted-foreground text-sm">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Blog Management Tab */}
          {activeTab === "blog" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BlogManager posts={blogPosts} onRefresh={fetchData} />
            </motion.div>
          )}

          {/* Gallery Management Tab */}
          {activeTab === "gallery" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GalleryManager media={galleryMedia} onRefresh={fetchData} />
            </motion.div>
          )}

          {/* User Roles Management Tab */}
          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <UserRoleManager onRefresh={fetchData} />
            </motion.div>
          )}

          {/* Donations Tab */}
          {activeTab === "donations" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-card overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations
                      .filter(
                        (d) =>
                          (d.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.donor_email?.toLowerCase().includes(searchTerm.toLowerCase())) ??
                          true
                      )
                      .map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-medium">
                            {donation.is_anonymous ? (
                              <span className="italic text-muted-foreground">Anonymous</span>
                            ) : (
                              donation.donor_name || "Unknown"
                            )}
                          </TableCell>
                          <TableCell>{donation.donor_email || "-"}</TableCell>
                          <TableCell>{donation.programs?.title || "General"}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatCurrency(Number(donation.amount))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                donation.payment_status === "completed" ? "default" : "secondary"
                              }
                            >
                              {donation.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(donation.created_at)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id} className={!contact.is_read ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {contact.name}
                            {!contact.is_read && <Badge variant="secondary">New</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.subject}</TableCell>
                        <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                        <TableCell>{formatDate(contact.created_at)}</TableCell>
                        <TableCell>
                          {!contact.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markContactAsRead(contact.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Volunteers Tab */}
          {activeTab === "volunteers" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                        <TableCell>{volunteer.email}</TableCell>
                        <TableCell>{volunteer.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              volunteer.status === "approved"
                                ? "default"
                                : volunteer.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {volunteer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(volunteer.created_at)}</TableCell>
                        <TableCell>
                          {volunteer.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateVolunteerStatus(volunteer.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateVolunteerStatus(volunteer.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Partners Tab */}
          {activeTab === "partners" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.organization_name}</TableCell>
                        <TableCell>{partner.contact_person}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              partner.status === "approved"
                                ? "default"
                                : partner.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(partner.created_at)}</TableCell>
                        <TableCell>
                          {partner.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updatePartnerStatus(partner.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePartnerStatus(partner.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {/* Program Inquiries Tab */}
          {activeTab === "inquiries" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl shadow-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} className={!inquiry.is_read ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {inquiry.name}
                            {!inquiry.is_read && <Badge variant="secondary">New</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{inquiry.email}</TableCell>
                        <TableCell>{inquiry.programs?.title || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{inquiry.inquiry_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{inquiry.message}</TableCell>
                        <TableCell>{formatDate(inquiry.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
