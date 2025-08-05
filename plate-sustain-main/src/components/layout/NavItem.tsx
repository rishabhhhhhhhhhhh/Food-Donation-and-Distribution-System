
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export default function NavItem({ to, label, icon, onClick, active }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active
          ? "bg-sustainPlate-green-light/20 text-sustainPlate-green-dark"
          : "hover:bg-sustainPlate-green-light/10 text-foreground/80 hover:text-sustainPlate-green"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
