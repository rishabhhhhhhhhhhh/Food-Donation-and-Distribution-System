
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import DonationCard from "@/components/donations/DonationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Donation } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function AvailableDonations() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "ngo") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { data: donations, isLoading } = useQuery({
    queryKey: ["available-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*, profiles!donations_donor_id_fkey(name)")
        .eq("status", "listed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map the database response to match our Donation type
      return data.map(item => ({
        id: item.id,
        donorId: item.donor_id,
        donorName: item.profiles?.name || "Unknown donor",
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
        pickupTime: item.pickup_time || undefined,
        volunteerId: item.volunteer_id || undefined,
      }));
    },
    enabled: !!currentUser?.id,
    refetchInterval: 5000, // Refetch every 5 seconds to get updated data
  });

  // Set up real-time subscription
  useEffect(() => {
    // Create a realtime subscription to donation changes
    const channel = supabase
      .channel('donation-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'donations'
        }, 
        () => {
          // When any donation changes, refresh the available donations list
          queryClient.invalidateQueries({ queryKey: ["available-donations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Available Donations</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Food Donations</CardTitle>
            <CardDescription>
              Browse and reserve available food donations from donors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading available donations...</p>
              </div>
            ) : donations?.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {donations.map((donation) => (
                  <DonationCard 
                    key={donation.id} 
                    donation={donation}
                    viewType="ngo"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available donations at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
