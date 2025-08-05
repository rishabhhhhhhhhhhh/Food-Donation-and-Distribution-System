
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Donation } from "@/lib/types";
import { AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DonationInfo from "@/components/donations/DonationInfo";
import PickupInfo from "@/components/donations/PickupInfo";
import ReservationButton from "@/components/donations/ReservationButton";

export default function DonationDetails() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "ngo") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { data: donation, isLoading, refetch } = useQuery({
    queryKey: ["donation", id],
    queryFn: async () => {
      console.log("Fetching donation details for ID:", id);
      
      const { data, error } = await supabase
        .from("donations")
        .select("*, profiles!donations_donor_id_fkey(name)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching donation:", error);
        throw error;
      }
      
      console.log("Donation data retrieved:", data);
      
      return {
        id: data.id,
        donorId: data.donor_id,
        donorName: data.profiles?.name || "Unknown donor",
        title: data.title,
        description: data.description || "",
        foodType: data.food_type,
        quantity: data.quantity,
        expiryDate: data.expiry_date,
        storageRequirements: data.storage_requirements || "Room temperature",
        pickupAddress: data.pickup_address,
        pickupInstructions: data.pickup_instructions || "",
        status: data.status as Donation["status"],
        createdAt: data.created_at || new Date().toISOString(),
        reservedBy: data.reserved_by || undefined,
        pickupTime: data.pickup_time || undefined,
        volunteerId: data.volunteer_id || undefined,
      };
    },
    enabled: !!id && !!currentUser?.id,
  });

  // Set up real-time subscription to this specific donation
  useEffect(() => {
    if (!id) return;
    
    // Subscribe to changes for this specific donation
    const channel = supabase
      .channel(`donation-${id}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'donations',
          filter: `id=eq.${id}`
        }, 
        (payload) => {
          console.log("Real-time update for donation:", payload);
          // When the donation changes, refetch it
          refetch();
          // Also invalidate the available donations and my reservations queries
          queryClient.invalidateQueries({ queryKey: ["available-donations"] });
          queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
          queryClient.invalidateQueries({ queryKey: ["donation-updates"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetch, queryClient]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!donation) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Donation not found</h2>
                <p className="text-muted-foreground mb-4">
                  The donation you are looking for does not exist or has been removed.
                </p>
                <Button onClick={() => navigate("/ngo/available-donations")}>
                  Back to Available Donations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const createdAt = new Date(donation.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <Layout>
      <div className="container py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/ngo/available-donations")}
          className="mb-6"
        >
          Back to Available Donations
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl">{donation.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Posted by {donation.donorName} • {timeAgo}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`status-badge status-${donation.status}`}>
                  {donation.status === "listed" ? "Available" : 
                   donation.status === "reserved" ? "Reserved" : 
                   donation.status === "pickedUp" ? "Picked Up" : "Delivered"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p>{donation.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DonationInfo donation={donation} />
              <PickupInfo donation={donation} />
            </div>
          </CardContent>
          
          {donation.status === "listed" && (
            <CardFooter>
              <ReservationButton 
                donation={donation} 
                currentUser={currentUser} 
              />
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
}
