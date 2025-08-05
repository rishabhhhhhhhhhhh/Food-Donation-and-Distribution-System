
import { Loader2 } from "lucide-react";
import { Donation } from "@/lib/types";
import NGOReservationTabs from "@/components/ngo/NGOReservationTabs";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReservationsDisplayProps {
  reservations: Donation[] | undefined;
  isLoading: boolean;
}

export default function ReservationsDisplay({ reservations, isLoading }: ReservationsDisplayProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Force a refetch of reservations on component mount
  useEffect(() => {
    if (currentUser?.id) {
      console.log("ReservationsDisplay: Refreshing reservation data for user:", currentUser.id);
      queryClient.invalidateQueries({ queryKey: ["my-reservations", currentUser.id] });
    }
  }, [currentUser?.id, queryClient]);

  // Set up real-time subscription for reservation updates
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const channel = supabase
      .channel('reservation-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'donations',
          filter: `reserved_by=eq.${currentUser.id}` 
        }, 
        (payload) => {
          console.log("Real-time update for reservation:", payload);
          queryClient.invalidateQueries({ queryKey: ["my-reservations", currentUser.id] });
        }
      )
      .subscribe();

    console.log("Subscribed to reservation updates for user:", currentUser.id);

    return () => {
      console.log("Unsubscribing from reservation updates");
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient]);

  const handleManualRefresh = () => {
    if (currentUser?.id) {
      queryClient.invalidateQueries({ queryKey: ["my-reservations", currentUser.id] });
      toast({
        title: "Refreshing",
        description: "Updating your reservations list...",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-sustainPlate-green" />
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-slate-50">
        <p className="text-muted-foreground">You haven't reserved any donations yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Check the available donations page to find donations to reserve.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh} 
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  console.log("ReservationsDisplay: Rendering reservations:", reservations.length);
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <NGOReservationTabs reservations={reservations} />
    </div>
  );
}
