
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Donation } from "@/lib/types";
import { User } from "@/lib/types";

export function useDonationDetails(id: string | undefined, currentUser: User | null) {
  const navigate = useNavigate();
  
  return useQuery({
    queryKey: ["donation", id],
    queryFn: async () => {
      if (!id) throw new Error("Donation ID is required");
      
      const { data, error } = await supabase
        .from("donations")
        .select(`
          *,
          reserved_ngo:profiles!donations_reserved_by_fkey(name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Ensure this donation belongs to the current user if donor
      if (currentUser?.role === "donor" && data.donor_id !== currentUser?.id) {
        navigate("/donor/donations");
        throw new Error("Unauthorized");
      }
      
      // Map the database response to match our Donation type
      return {
        id: data.id,
        donorId: data.donor_id,
        donorName: currentUser?.name || "Unknown",
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
        reservedByName: data.reserved_ngo?.name,
        pickupTime: data.pickup_time || undefined,
        volunteerId: data.volunteer_id || undefined,
        volunteerName: undefined,
      } as Donation;
    },
    enabled: !!id && !!currentUser?.id,
    refetchInterval: 5000, // Poll for updates
  });
}
