
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Donation } from "@/lib/types";
import { Eye, Clock, PackageCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface DonationCardActionsProps {
  donation: Donation;
  viewType: "donor" | "ngo" | "volunteer";
}

export default function DonationCardActions({ donation, viewType }: DonationCardActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewDetails = () => {
    if (viewType === "donor") {
      navigate(`/donor/donation/${donation.id}`);
    } else if (viewType === "ngo") {
      navigate(`/ngo/donation/${donation.id}`);
    }
  };

  const handleStatusUpdate = async (newStatus: "reserved" | "delivered") => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('donations')
        .update({ 
          status: newStatus,
          reserved_by: newStatus === "reserved" ? currentUser.id : donation.reservedBy
        })
        .eq('id', donation.id)
        .eq('status', newStatus === "reserved" ? "listed" : "reserved"); // Ensure correct status transition

      if (error) throw error;

      // Invalidate queries to force a refresh
      queryClient.invalidateQueries({ queryKey: ["available-donations"] });
      queryClient.invalidateQueries({ queryKey: ["donation-updates"] });
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["donation", donation.id] });
      
      toast({
        title: "Status updated",
        description: `Donation has been ${newStatus === "reserved" ? "reserved" : "marked as delivered"}`,
      });

      // If it's a reservation, navigate to the my-reservations page
      if (newStatus === "reserved") {
        navigate("/ngo/my-reservations");
      }

    } catch (error) {
      console.error("Error updating donation status:", error);
      toast({
        title: "Error updating status",
        description: "There was a problem updating the donation status",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show delivered button only on reserved donations that were reserved by current user
  if (donation.status === "reserved" && donation.reservedBy === currentUser?.id && viewType === "ngo") {
    return (
      <div className="mt-4 flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleStatusUpdate("delivered")}
          disabled={isProcessing}
          className="bg-sustainPlate-status-delivered hover:bg-sustainPlate-status-delivered/80 text-white"
        >
          <PackageCheck className="mr-2 h-4 w-4" />
          Mark Delivered
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewDetails}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </div>
    );
  }

  // Only show View Details button for all other cases
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleViewDetails}
      >
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </Button>
    </div>
  );
}
