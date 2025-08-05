
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ReservationsDisplay from "@/components/ngo/ReservationsDisplay";
import { useMyReservations } from "@/hooks/useMyReservations";
import ReservationStats from "@/components/ngo/ReservationStats";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function MyReservations() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "ngo") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { data: reservations, isLoading } = useMyReservations(currentUser?.id);

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
          <Link to="/ngo/available-donations">
            <Button variant="outline">
              Browse Available Donations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        {reservations && reservations.length > 0 && (
          <ReservationStats reservations={reservations} className="mb-6" />
        )}

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle>Reserved Donations</CardTitle>
            <CardDescription>
              Manage the food donations you have reserved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationsDisplay reservations={reservations} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
