import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEvents, getParticipants, registerParticipant, EventResponse, ParticipantResponse } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type EventCategory = "cultural" | "technical" | "sports";
type EventStatus = "upcoming" | "ongoing" | "completed";

type NormalizedEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: EventCategory;
  status: EventStatus;
};

interface RegistrationFormState {
  name: string;
  dept: string;
  year: string;
  eventId: string;
}

const categoryFilters: { label: string; value: EventCategory | "all" }[] = [
  { label: "All Events", value: "all" },
  { label: "Technical", value: "technical" },
  { label: "Cultural", value: "cultural" },
  { label: "Sports", value: "sports" },
];

const statusFilters: { label: string; value: EventStatus | "all" }[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

const normalizeCategory = (category: string | null): EventCategory => {
  if (category === "cultural" || category === "technical" || category === "sports") {
    return category;
  }
  return "technical";
};

const normalizeStatus = (status: string | null): EventStatus => {
  if (status === "ongoing" || status === "completed") {
    return status;
  }
  return "upcoming";
};

const formatEventDate = (date: string | null, time: string | null) => {
  if (!date) {
    return "Date to be announced";
  }

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) {
    return date;
  }

  const datePart = dateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (!time) {
    return datePart;
  }

  const timeObj = new Date(`${date}T${time}`);
  const timePart = Number.isNaN(timeObj.getTime())
    ? time
    : timeObj.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });

  return `${datePart} • ${timePart}`;
};

const Events = () => {
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [participants, setParticipants] = useState<ParticipantResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");
  const [activeStatus, setActiveStatus] = useState<EventStatus | "all">("all");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [formState, setFormState] = useState<RegistrationFormState>({
    name: "",
    dept: "",
    year: "",
    eventId: "",
  });
  const { toast } = useToast();
  const registrationRef = useRef<HTMLDivElement | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await getEvents();
      const normalized = data.map((event: EventResponse) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: formatEventDate(event.date, event.time),
        venue: event.venue,
        category: normalizeCategory(event.category),
        status: normalizeStatus(event.status),
      }));
      setEvents(normalized);
      if (!formState.eventId && normalized.length > 0) {
        setFormState((prev) => ({ ...prev, eventId: normalized[0]?.id || "" }));
      }
    } catch (error) {
      console.error("Failed to load events", error);
      toast({
        title: "Unable to load events",
        description: "Something went wrong while fetching events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingEvents(false);
    }
  }, [formState.eventId, toast]);

  const loadParticipants = useCallback(async () => {
    setLoadingParticipants(true);
    try {
      const data = await getParticipants();
      setParticipants(data);
    } catch (error) {
      console.error("Failed to load participants", error);
    } finally {
      setLoadingParticipants(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadParticipants();
  }, [loadEvents, loadParticipants]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = activeCategory === "all" || event.category === activeCategory;
      const matchesStatus = activeStatus === "all" || event.status === activeStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchTerm, activeCategory, activeStatus]);

  const participantCounts = useMemo(() => {
    return participants.reduce<Record<string, number>>((acc, participant) => {
      acc[participant.event_id] = (acc[participant.event_id] || 0) + 1;
      return acc;
    }, {});
  }, [participants]);

  const handleInputChange = (field: keyof RegistrationFormState) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (eventId?: string) => {
    if (eventId) {
      setFormState((prev) => ({ ...prev, eventId }));
      registrationRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!formState.name || !formState.dept || !formState.year || !formState.eventId) {
      toast({
        title: "Missing details",
        description: "Please complete all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    const yearValue = Number(formState.year);
    if (!Number.isInteger(yearValue) || yearValue < 1 || yearValue > 10) {
      toast({
        title: "Invalid year",
        description: "Year must be a number between 1 and 10.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRegistering(true);
      await registerParticipant({
        name: formState.name,
        dept: formState.dept,
        year: yearValue,
        event_id: formState.eventId,
      });
      toast({
        title: "Registration successful",
        description: "You have been registered for the event.",
      });
      setFormState({
        name: "",
        dept: "",
        year: "",
        eventId: formState.eventId,
      });
      await loadParticipants();
    } catch (error) {
      console.error("Registration failed", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unable to complete registration.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-7xl space-y-12">
          <div>
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                All Events
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse and register for upcoming college events
              </p>
            </div>

            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              {categoryFilters.map((filter) => (
                <Badge
                  key={filter.value}
                  variant={activeCategory === filter.value ? "default" : "outline"}
                  className="px-4 py-2 cursor-pointer transition-colors"
                  onClick={() => setActiveCategory(filter.value)}
                >
                  {filter.label}
                </Badge>
              ))}
              <div className="flex flex-wrap gap-3 ml-auto">
                {statusFilters.map((filter) => (
                  <Badge
                    key={filter.value}
                    variant={activeStatus === filter.value ? "default" : "outline"}
                    className="px-4 py-2 cursor-pointer transition-colors"
                    onClick={() => setActiveStatus(filter.value)}
                  >
                    {filter.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingEvents
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-64 rounded-xl border border-dashed border-muted animate-pulse bg-muted/20"
                    />
                  ))
                : filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      {...event}
                      participants={participantCounts[event.id] || 0}
                      onRegister={() => handleRegister(event.id)}
                      registering={registering}
                    />
                  ))}
            </div>
            {!loadingEvents && filteredEvents.length === 0 && (
              <p className="text-muted-foreground mt-6">
                No events match your filters right now. Try adjusting your search or check back later.
              </p>
            )}
          </div>

          <div ref={registrationRef} className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Quick Registration</h2>
                <p className="text-muted-foreground">
                  Fill in your details to register instantly for your selected event.
                </p>
              </div>
              <Button
                type="button"
                size="lg"
                onClick={() => handleRegister()}
                disabled={registering}
              >
                {registering ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={formState.name}
                  onChange={(event) => handleInputChange("name")(event.target.value)}
                  disabled={registering}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Input
                  id="dept"
                  placeholder="Computer Science"
                  value={formState.dept}
                  onChange={(event) => handleInputChange("dept")(event.target.value)}
                  disabled={registering}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  placeholder="3"
                  value={formState.year}
                  onChange={(event) => handleInputChange("year")(event.target.value)}
                  disabled={registering}
                />
              </div>
              <div className="space-y-2">
                <Label>Event</Label>
                <Select
                  value={formState.eventId}
                  disabled={registering || events.length === 0}
                  onValueChange={(value) => handleInputChange("eventId")(value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Recent Participants</h2>
                <p className="text-muted-foreground">
                  Stay updated with recent registrations across events.
                </p>
              </div>
              <Button variant="outline" size="lg" onClick={loadParticipants} disabled={loadingParticipants}>
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              {loadingParticipants ? (
                <div className="h-32 rounded-xl border border-dashed border-muted animate-pulse bg-muted/20" />
              ) : participants.length === 0 ? (
                <p className="text-muted-foreground">
                  No participants yet. Be the first to register for an event!
                </p>
              ) : (
                participants.slice(0, 10).map((participant) => (
                  <div
                    key={participant.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 rounded-2xl border border-border bg-background/60"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {participant.dept} • Year {participant.year}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      <p>{participant.event_title || "Event"}</p>
                      <p className="text-xs">
                        {new Date(participant.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;
