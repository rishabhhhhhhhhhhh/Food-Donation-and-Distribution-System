
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import DonationCard from "@/components/donations/DonationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Donation } from "@/lib/types";

export default function MyDonations() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "donor") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { data: donations, isLoading } = useQuery({
    queryKey: ["my-donations", currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*, profiles!donations_donor_id_fkey(name)")
        .eq("donor_id", currentUser?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map the database response to match our Donation type
      return data.map(item => ({
        id: item.id,
        donorId: item.donor_id,
        donorName: currentUser?.name || "Unknown",
        title: item.title,
        description: item.description || "",
        foodType: item.food_type,
        quantity: item.quantity,
        expiryDate: item.expiry_date,
        storageRequirements: item.storage_requirements || "Room temperature",
        pickupAddress: item.pickup_address,
        pickupInstructions: item.pickup_instructions || "",
        status: item.status as Donation["status"],
        createdAt: item.created_at || new Date().toISOString(),
        reservedBy: item.reserved_by || undefined,
        reservedByName: undefined, // We don't have this information yet
        pickupTime: item.pickup_time || undefined,
        volunteerId: item.volunteer_id || undefined,
        volunteerName: undefined, // We don't have this information yet
      }));
    },
    enabled: !!currentUser?.id,
  });

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Donations</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>All Donations</CardTitle>
            <CardDescription>
              View and manage all your food donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : donations?.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {donations.map((donation) => (
                  <DonationCard 
                    key={donation.id} 
                    donation={donation}
                    viewType="donor"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't created any donations yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
