
import NavItem from "./NavItem";

interface NavMenuProps {
  navItems: {
    to: string;
    label: string;
    icon: React.ReactNode;
  }[];
  location: string;
  isAuthenticated: boolean;
}

export default function DesktopNavMenu({ navItems, location, isAuthenticated }: NavMenuProps) {
  if (!isAuthenticated) return null;

  return (
    <nav className="hidden md:flex ml-8 flex-1 items-center gap-6">
      {navItems.map((item, index) => (
        <NavItem
          key={index}
          to={item.to}
          label={item.label}
          icon={item.icon}
          active={location === item.to}
        />
      ))}
    </nav>
  );
}
