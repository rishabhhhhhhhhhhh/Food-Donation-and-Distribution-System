
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Utensils, 
  Heart, 
  Calendar,
  List,
  Bell,
} from "lucide-react";
import DesktopNavMenu from "@/components/layout/DesktopNavMenu";
import MobileNavMenu from "@/components/layout/MobileNavMenu";
import Footer from "@/components/layout/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getNavItems = () => {
    const role = currentUser?.role;
    const commonItems = [
      {
        to: "/profile",
        label: "Profile",
        icon: <User size={20} />,
      },
    ];

    if (role === "donor") {
      return [
        { to: "/donor/dashboard", label: "Dashboard", icon: <Home size={20} /> },
        { to: "/donor/donations", label: "My Donations", icon: <Utensils size={20} /> },
        { to: "/donor/create-donation", label: "Create Donation", icon: <List size={20} /> },
        ...commonItems,
      ];
    }
    if (role === "ngo") {
      return [
        { to: "/ngo/dashboard", label: "Dashboard", icon: <Home size={20} /> },
        { to: "/ngo/available-donations", label: "Available Donations", icon: <Utensils size={20} /> },
        { to: "/ngo/my-reservations", label: "My Reservations", icon: <Heart size={20} /> },
        ...commonItems,
      ];
    }
    if (role === "volunteer") {
      return [
        { to: "/volunteer/dashboard", label: "Dashboard", icon: <Home size={20} /> },
        { to: "/volunteer/available-tasks", label: "Available Tasks", icon: <List size={20} /> },
        { to: "/volunteer/my-schedule", label: "My Schedule", icon: <Calendar size={20} /> },
        ...commonItems,
      ];
    }
    // Default navigation for logged out users
    return [
      { to: "/", label: "Home", icon: <Home size={20} /> },
      { to: "/about", label: "About", icon: <Heart size={20} /> },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/lovable-uploads/ed233620-3184-47b8-86ea-d13908d35950.png"
                alt="SustainPlate Logo"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold text-xl hidden sm:inline-block">SustainPlate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNavMenu navItems={navItems} location={location.pathname} isAuthenticated={isAuthenticated} />

          {/* Auth Buttons */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-sustainPlate-orange rounded-full"></span>
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut size={20} className="mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => navigate("/register")}
                  className="bg-sustainPlate-green hover:bg-sustainPlate-green-dark"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <MobileNavMenu
          navItems={navItems}
          location={location.pathname}
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
