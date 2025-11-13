import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Sparkles, CheckCircle, Bell } from "lucide-react";
import { getEvents, EventResponse } from "@/lib/api";

type FeaturedEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: "cultural" | "technical" | "sports";
  status: "upcoming" | "ongoing" | "completed";
};

const normalizeCategory = (category: string | null): FeaturedEvent["category"] => {
  if (category === "cultural" || category === "technical" || category === "sports") {
    return category;
  }
  return "technical";
};

const normalizeStatus = (status: string | null): FeaturedEvent["status"] => {
  if (status === "ongoing" || status === "completed") {
    return status;
  }
  return "upcoming";
};

const formatEventDate = (date: string | null) => {
  if (!date) {
    return "Date to be announced";
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Index = () => {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        const normalized = data
          .map((event: EventResponse) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: formatEventDate(event.date),
            venue: event.venue,
            category: normalizeCategory(event.category),
            status: normalizeStatus(event.status),
          }))
          .slice(0, 3);
        setEvents(normalized);
      } catch (error) {
        console.error("Failed to load featured events", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const stats = [
    { icon: Calendar, label: "Active Events", value: "25+" },
    { icon: Users, label: "Registered Students", value: "3000+" },
  ];

  const fallbackEvents = useMemo(
    () => [
      {
        id: "fallback-1",
        title: "TechFest Spotlight",
        description: "Stay tuned for upcoming events across technical, cultural, and sports domains.",
        date: "Coming Soon",
        venue: "Campus Venues",
        category: "technical" as const,
        status: "upcoming" as const,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
              <Sparkles className="w-4 h-4" />
              <span>Track & Register for Campus Events</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Discover Events.
              </span>
              <br />
              <span className="text-foreground">Register Instantly.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse all college events and register with a single click. Stay updated with real-time notifications.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg h-12 px-8">
                Browse Events
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-card)] transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Featured Events
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover upcoming events and register to be part of something amazing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {(events.length > 0 ? events : fallbackEvents).map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
            {loading &&
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 rounded-xl border border-dashed border-muted animate-pulse bg-muted/20"
                />
              ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="text-lg h-12 px-8">
              View All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simple Event Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to track and register for events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-card)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Track Events</h3>
              <p className="text-muted-foreground">
                Browse all college events with detailed information about date, venue, and category.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-card)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Quick Registration</h3>
              <p className="text-muted-foreground">
                Register for events instantly with a simple click. No complicated forms or paperwork.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-card)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Stay Updated</h3>
              <p className="text-muted-foreground">
                Get real-time updates about your registered events and never miss an important detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join Campus Events?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Create your account and start registering for events today
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="text-lg h-12 px-8">
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-12 px-8 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-secondary/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CampusEvents
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2025 CampusEvents. Track and register for campus events effortlessly.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
