
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Donation, DonationStatus } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

export function useDonationUpdates(userId: string, type: "donor" | "ngo" = "donor") {
  const [donations, setDonations] = useState<Donation[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    
    // Initial fetch
    const fetchDonations = async () => {
      console.log(`Fetching donations for user ${userId} as ${type}`);
      
      try {
        const query = supabase
          .from('donations')
          .select(`
            *,
            donor:profiles!donations_donor_id_fkey(name),
            reserved_ngo:profiles!donations_reserved_by_fkey(name)
          `);
          
        // Filter based on type (donor or ngo)
        if (type === "donor") {
          query.eq('donor_id', userId);
        } else if (type === "ngo") {
          query.eq('reserved_by', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching donations:", error);
          return;
        }

        if (data) {
          console.log(`Found ${data.length} donations for user ${userId} as ${type}`);
          
          const formattedDonations: Donation[] = data.map(item => ({
            id: item.id,
            donorId: item.donor_id,
            donorName: item.donor?.name || "", 
            title: item.title,
            description: item.description || "",
            foodType: item.food_type,
            quantity: item.quantity,
            expiryDate: item.expiry_date,
            storageRequirements: item.storage_requirements || "",
            pickupAddress: item.pickup_address,
            pickupInstructions: item.pickup_instructions || "",
            status: item.status as DonationStatus,
            createdAt: item.created_at || new Date().toISOString(),
            reservedBy: item.reserved_by,
            reservedByName: item.reserved_ngo?.name,
            pickupTime: item.pickup_time,
            volunteerId: item.volunteer_id,
            volunteerName: undefined,
          }));
          
          setDonations(formattedDonations);
          
          // Update the query cache with this fresh data
          if (type === "ngo") {
            queryClient.setQueryData(["my-reservations", userId], formattedDonations);
          } else {
            queryClient.setQueryData(["donation-updates", userId, type], formattedDonations);
          }
        }
      } catch (err) {
        console.error("Exception fetching donations:", err);
      }
    };

    fetchDonations();

    // Subscribe to changes
    const channel = supabase
      .channel('donation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations',
          filter: type === "donor" ? `donor_id=eq.${userId}` : `reserved_by=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          fetchDonations(); // Refresh data when changes occur
        }
      )
      .subscribe();

    console.log(`Subscribed to realtime updates for ${type}: ${userId}`);

    return () => {
      console.log("Unsubscribing from donation changes");
      supabase.removeChannel(channel);
    };
  }, [userId, type, queryClient]);

  return donations;
}
