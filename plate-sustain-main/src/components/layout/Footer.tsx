
import { Utensils } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        {/* Logo section (match header) */}
        <div className="flex items-center gap-2">
          <img
            src="/lovable-uploads/ed233620-3184-47b8-86ea-d13908d35950.png"
            alt="SustainPlate Logo"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-semibold">SustainPlate</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SustainPlate. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground">
            Team
          </Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
