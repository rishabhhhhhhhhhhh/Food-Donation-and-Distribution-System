
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MapPin, Clock, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "volunteer") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { data: task, isLoading, refetch } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select(`
          id,
          title,
          status,
          pickup_address,
          pickup_time,
          volunteer_id,
          profiles!donations_donor_id_fkey(name, address),
          profiles!donations_reserved_by_fkey(name, address)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      const deliveryAddress = data.profiles?.address || "Contact NGO for address";
      
      return {
        id: data.id,
        donationId: data.id,
        donationTitle: data.title,
        pickupAddress: data.pickup_address,
        deliveryAddress,
        pickupTime: data.pickup_time || new Date().toISOString(),
        status: data.volunteer_id ? 
               (data.status === "pickedUp" ? "assigned" : "completed") :
               "available",
        volunteerId: data.volunteer_id,
        volunteerName: currentUser?.name
      };
    },
    enabled: !!id && !!currentUser?.id,
    refetchInterval: 3000, // Refetch every 3 seconds
  });

  // Set up real-time subscription for task updates
  useEffect(() => {
    if (!id) return;
    
    // Subscribe to changes for this specific task
    const channel = supabase
      .channel(`task-${id}-updates`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'donations',
          filter: `id=eq.${id}`
        }, 
        (payload) => {
          console.log("Real-time update for task:", payload);
          refetch();
        }
      )
      .subscribe();

    console.log("Subscribed to task updates for task:", id);

    return () => {
      console.log("Unsubscribing from task updates");
      supabase.removeChannel(channel);
    };
  }, [id, refetch]);

  const handleAssignTask = async () => {
    if (!currentUser || !task) return;
    
    setIsAssigning(true);
    try {
      // First check if task is still available
      const { data: checkData, error: checkError } = await supabase
        .from("donations")
        .select("volunteer_id, status")
        .eq("id", task.id)
        .single();
        
      if (checkError) {
        console.error("Error checking task availability:", checkError);
        throw checkError;
      }
      
      if (checkData.volunteer_id) {
        toast({
          title: "Task unavailable",
          description: "This task has already been assigned to another volunteer.",
          variant: "destructive",
        });
        refetch();
        setIsAssigning(false);
        return;
      }
      
      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If still available, assign it
      const { error } = await supabase
        .from("donations")
        .update({
          volunteer_id: currentUser.id,
        })
        .eq("id", task.id)
        .is("volunteer_id", null); // Only allow assignment if no volunteer assigned
      
      if (error) {
        console.error("Error assigning task:", error);
        throw error;
      }
      
      // Verify assignment
      const { data: verifyData, error: verifyError } = await supabase
        .from("donations")
        .select("volunteer_id")
        .eq("id", task.id)
        .single();
        
      if (verifyError) {
        console.error("Error verifying assignment:", verifyError);
        throw verifyError;
      }
      
      if (verifyData.volunteer_id !== currentUser.id) {
        console.error("Assignment verification failed:", verifyData);
        throw new Error("Assignment verification failed");
      }
      
      toast({
        title: "Task assigned",
        description: "You have successfully signed up for this delivery task",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["available-tasks"] });
      
      refetch();
    } catch (error: any) {
      console.error("Task assignment error:", error);
      toast({
        title: "Assignment failed",
        description: "There was an error assigning this task. It may already be assigned.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "pickedUp" | "delivered") => {
    if (!currentUser || !task) return;
    
    setIsUpdating(true);
    try {
      console.log(`Updating task status to ${newStatus} for task:`, task.id);
      
      const { error } = await supabase
        .from("donations")
        .update({
          status: newStatus,
        })
        .eq("id", task.id)
        .eq("volunteer_id", currentUser.id);
      
      if (error) {
        console.error("Status update error:", error);
        throw error;
      }
      
      // Verify the status update
      const { data: verifyData, error: verifyError } = await supabase
        .from("donations")
        .select("status")
        .eq("id", task.id)
        .single();
        
      if (verifyError) {
        console.error("Status verification error:", verifyError);
        throw verifyError;
      }
      
      if (verifyData.status !== newStatus) {
        console.error("Status verification failed:", verifyData);
        throw new Error("Status update verification failed");
      }
      
      toast({
        title: "Status updated",
        description: newStatus === "pickedUp" 
          ? "Donation has been marked as picked up" 
          : "Delivery has been completed successfully",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["available-tasks"] });
      
      refetch();
    } catch (error: any) {
      console.error("Status update error:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing task",
      description: "Getting the latest task details...",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Task not found</h2>
                <p className="text-muted-foreground mb-4">
                  The task you are looking for does not exist or has been removed.
                </p>
                <Button onClick={() => navigate("/volunteer/available-tasks")}>
                  Back to Available Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const pickupTime = new Date(task.pickupTime);
  const isAssigned = task.volunteerId === currentUser?.id;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/volunteer/dashboard")}
          >
            Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl">{task.donationTitle}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {isAssigned ? "You are assigned to this task" : "This task needs a volunteer"}
                </div>
              </div>
              <div>
                <span className={`status-badge ${
                  task.status === "available" ? "status-listed" : 
                  task.status === "assigned" ? "status-pickedUp" :
                  "status-delivered"
                }`}>
                  {task.status === "available" ? "Available" : 
                   task.status === "assigned" ? "In Progress" : 
                   "Completed"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Pickup Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-sustainPlate-status-listed mt-1" />
                    <div>
                      <p className="font-medium">Pickup Address</p>
                      <p>{task.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-sustainPlate-orange mt-1" />
                    <div>
                      <p className="font-medium">Pickup Time</p>
                      <p>{pickupTime.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Delivery Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-sustainPlate-status-delivered mt-1" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p>{task.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            {!isAssigned && task.status === "available" && (
              <Button 
                onClick={handleAssignTask}
                disabled={isAssigning}
                className="w-full md:w-auto bg-sustainPlate-green hover:bg-sustainPlate-green-dark"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Sign Up for This Task"
                )}
              </Button>
            )}
            
            {isAssigned && task.status === "available" && (
              <Button 
                onClick={() => handleUpdateStatus("pickedUp")}
                disabled={isUpdating}
                className="w-full md:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Mark as Picked Up"
                )}
              </Button>
            )}
            
            {isAssigned && task.status === "assigned" && (
              <Button 
                onClick={() => handleUpdateStatus("delivered")}
                disabled={isUpdating}
                className="w-full md:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Complete Delivery"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
