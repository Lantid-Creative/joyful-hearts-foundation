import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/shared/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  is_published: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: true });
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const upcomingEvents = events.filter((e) => !isPast(new Date(e.event_date)));
  const pastEvents = events.filter((e) => isPast(new Date(e.event_date)));

  return (
    <Layout>
      <SEOHead
        title="Upcoming Events"
        description="Join RHRCI at our upcoming events and outreach programs across rural communities in Nigeria."
        path="/events"
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hope">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Upcoming Events
            </h1>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto text-lg">
              Stay informed about our planned activities, outreach programs, and community engagements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl p-6 shadow-card animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {upcomingEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                  {upcomingEvents.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card rounded-xl p-6 shadow-card border-l-4 border-primary hover:shadow-elevated transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-xl p-3 text-center min-w-[70px]">
                          <p className="font-display text-2xl font-bold text-primary">
                            {format(new Date(event.event_date), "dd")}
                          </p>
                          <p className="text-xs font-body text-muted-foreground uppercase">
                            {format(new Date(event.event_date), "MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="text-muted-foreground font-body text-sm mb-3">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(event.event_date), "h:mm a")}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl text-muted-foreground mb-2">
                    No upcoming events at the moment
                  </h3>
                  <p className="text-muted-foreground font-body text-sm">
                    Check back soon for new activities and programs.
                  </p>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Past Events
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastEvents.slice(0, 6).map((event) => (
                      <div
                        key={event.id}
                        className="bg-muted/50 rounded-xl p-5 border border-border"
                      >
                        <p className="text-xs font-body text-muted-foreground mb-1">
                          {format(new Date(event.event_date), "MMM dd, yyyy")}
                        </p>
                        <h4 className="font-display text-base font-semibold text-foreground mb-1">
                          {event.title}
                        </h4>
                        {event.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Events;
