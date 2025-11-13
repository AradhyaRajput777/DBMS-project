import { NavLink } from "./NavLink";
import { Calendar } from "lucide-react";
import { Button } from "./ui/button";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CampusEvents
            </span>
          </NavLink>

          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/events"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary font-medium"
            >
              Events
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Login
            </Button>
            <Button size="sm" className="bg-accent hover:bg-accent/90">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
