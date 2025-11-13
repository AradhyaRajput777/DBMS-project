import { Calendar, MapPin, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  venue: string;
  category: "cultural" | "technical" | "sports";
  participants?: number;
  status: "upcoming" | "ongoing" | "completed";
  onRegister?: () => void;
  registering?: boolean;
}

const categoryColors = {
  cultural: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  technical: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  sports: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const statusColors = {
  upcoming: "bg-accent/10 text-accent border-accent/20",
  ongoing: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
};

export const EventCard = ({
  title,
  description,
  date,
  venue,
  category,
  participants = 0,
  status,
  onRegister,
  registering = false,
}: EventCardProps) => {
  return (
    <Card className="group relative overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300 bg-gradient-to-br from-card to-secondary/30">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          <Badge variant="outline" className={statusColors[status]}>
            {status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{venue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge className={categoryColors[category]}>
              {category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participants} registered</span>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            className="bg-accent hover:bg-accent/90"
            onClick={onRegister}
            disabled={!onRegister || registering}
          >
            Register Now
          </Button>
        </div>
      </div>
    </Card>
  );
};
