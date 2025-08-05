
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Search, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDonationUpdates } from "@/hooks/useDonationUpdates";
import NGOStatsCards from "@/components/ngo/NGOStatsCards";
import NGOReservationTabs from "@/components/ngo/NGOReservationTabs";

export default function NGODashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const reservations = useDonationUpdates(currentUser?.id || "", "ngo");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "ngo") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const stats = {
    total: reservations.length,
    pending: reservations.filter((d) => d.status === "reserved").length,
    pickups: reservations.filter((d) => d.status === "pickedUp").length,
    received: reservations.filter((d) => d.status === "delivered").length,
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">NGO Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your food reservations and find available donations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Button 
              onClick={() => navigate("/ngo/my-reservations")}
              className="bg-sustainPlate-status-reserved hover:bg-sustainPlate-status-reserved/80"
            >
              <ClipboardList size={16} className="mr-2" />
              My Reservations
            </Button>
            <Button 
              onClick={() => navigate("/ngo/available-donations")}
              className="bg-sustainPlate-green hover:bg-sustainPlate-green-dark"
            >
              <Search size={16} className="mr-2" />
              Browse Donations
            </Button>
          </div>
        </div>

        <NGOStatsCards 
          total={stats.total}
          pending={stats.pending}
          pickups={stats.pickups}
          received={stats.received}
        />

        <NGOReservationTabs reservations={reservations} />
      </div>
    </Layout>
  );
}
