
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from "@/components/volunteers/TaskCard";
import { VolunteerTask } from "@/lib/types";
import { Loader2, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function AvailableTasks() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filterDistance, setFilterDistance] = useState<string>("all");
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== "volunteer") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ["available-tasks"],
    queryFn: async () => {
      // Get all reserved donations that don't have a volunteer assigned
      const { data, error } = await supabase
        .from("donations")
        .select(`
          id,
          title,
          pickup_address,
          pickup_time,
          status,
          profiles!donations_donor_id_fkey(name, address),
          profiles!donations_reserved_by_fkey(name, address)
        `)
        .eq("status", "reserved")
        .is("volunteer_id", null);

      if (error) {
        console.error("Error fetching available tasks:", error);
        throw error;
      }
      
      console.log("Available tasks data:", data);
      
      // Map the database response to match our VolunteerTask type
      return data.map(item => ({
        id: item.id,
        donationId: item.id,
        donationTitle: item.title,
        pickupAddress: item.pickup_address,
        deliveryAddress: item.profiles ? item.profiles.address || "Contact NGO for address" : "Contact NGO for address",
        pickupTime: item.pickup_time || new Date().toISOString(),
        status: "available" as const, // Use const assertion to make TypeScript happy
        volunteerId: undefined,
        volunteerName: undefined
      })) as VolunteerTask[];
    },
    enabled: !!currentUser?.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["available-tasks"] });
    toast({
      title: "Refreshing tasks",
      description: "Getting the latest available tasks...",
    });
  };

  // For demo purposes, filter tasks - in a real app we'd filter by geolocation
  const filteredTasks = tasks || [];

  // Set up real-time subscription for task updates
  useEffect(() => {
    // Create a realtime subscription to donation changes
    const channel = supabase
      .channel('volunteer-task-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'donations',
          filter: 'volunteer_id=is.null' 
        }, 
        (payload) => {
          console.log("Real-time update for volunteer tasks:", payload);
          // When any donation changes, refresh the available tasks list
          queryClient.invalidateQueries({ queryKey: ["available-tasks"] });
        }
      )
      .subscribe();

    console.log("Subscribed to volunteer task updates");

    return () => {
      console.log("Unsubscribing from volunteer task updates");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Available Delivery Tasks</h1>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Volunteer Opportunities</CardTitle>
                <CardDescription>
                  Help deliver food from donors to NGOs in need
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading available tasks...</p>
              </div>
            ) : filteredTasks.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onAction={() => navigate(`/volunteer/task/${task.id}`)}
                    actionLabel="Sign Up"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available tasks at the moment</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
