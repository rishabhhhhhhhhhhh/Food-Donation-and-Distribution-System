
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Team from "./pages/Team";

// Donor Pages
import DonorDashboard from "./pages/donor/DonorDashboard";
import CreateDonation from "./pages/donor/CreateDonation";
import MyDonations from "./pages/donor/MyDonations";
import DonationDetails from "./pages/donor/DonationDetails";

// NGO Pages
import NGODashboard from "./pages/ngo/NGODashboard";
import AvailableDonations from "./pages/ngo/AvailableDonations";
import NGODonationDetails from "./pages/ngo/DonationDetails";
import MyReservations from "./pages/ngo/MyReservations";

// Volunteer Pages
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import AvailableTasks from "./pages/volunteer/AvailableTasks";
import TaskDetails from "./pages/volunteer/TaskDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/team" element={<Team />} />

          {/* Donor Routes */}
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/create-donation" element={<CreateDonation />} />
          <Route path="/donor/donations" element={<MyDonations />} />
          <Route path="/donor/donation/:id" element={<DonationDetails />} />
          
          {/* NGO Routes */}
          <Route path="/ngo/dashboard" element={<NGODashboard />} />
          <Route path="/ngo/available-donations" element={<AvailableDonations />} />
          <Route path="/ngo/donation/:id" element={<NGODonationDetails />} />
          <Route path="/ngo/my-reservations" element={<MyReservations />} />
          
          {/* Volunteer Routes */}
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/available-tasks" element={<AvailableTasks />} />
          <Route path="/volunteer/task/:id" element={<TaskDetails />} />
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
