
import NavItem from "./NavItem";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface MobileNavMenuProps {
  navItems: {
    to: string;
    label: string;
    icon: React.ReactNode;
  }[];
  location: string;
  isAuthenticated: boolean;
  handleLogout: () => void;
}

export default function MobileNavMenu({ navItems, location, isAuthenticated, handleLogout }: MobileNavMenuProps) {
  return (
    <div className="fixed inset-0 top-16 z-20 bg-background md:hidden">
      <nav className="container py-4">
        <div className="flex flex-col gap-2">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={location === item.to}
            />
          ))}
          {isAuthenticated && (
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-3 px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}
