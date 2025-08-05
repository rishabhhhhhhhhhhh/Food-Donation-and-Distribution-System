
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { VolunteerTask } from "@/lib/types";
import { volunteerTasks as mockTasks } from "@/lib/mock-data";
import TaskCard from "@/components/volunteers/TaskCard";
import { Search, ChevronRight, Calendar, Clock, CheckCircle } from "lucide-react";

export default function VolunteerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [assignedTasks, setAssignedTasks] = useState<VolunteerTask[]>([]);
  const [availableTasks, setAvailableTasks] = useState<VolunteerTask[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "volunteer") {
      navigate("/login");
      return;
    }

    // Filter tasks for the current volunteer
    const volTasks = mockTasks.filter(
      (task) => task.volunteerId === currentUser.id
    );
    
    // Filter available tasks
    const available = mockTasks.filter(
      (task) => task.status === "available"
    );
    
    setAssignedTasks(volTasks);
    setAvailableTasks(available);

    // Calculate stats
    setStats({
      total: volTasks.length,
      upcoming: volTasks.filter((t) => t.status === "assigned").length,
      completed: volTasks.filter((t) => t.status === "completed").length,
    });
  }, [currentUser, navigate]);

  const getRecentAvailableTasks = () => {
    return availableTasks.slice(0, 3);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Volunteer Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your delivery tasks and find available opportunities
            </p>
          </div>
          <Button 
            onClick={() => navigate("/volunteer/available-tasks")}
            className="mt-4 md:mt-0 bg-sustainPlate-green hover:bg-sustainPlate-green-dark"
          >
            <Search size={16} className="mr-2" />
            Find Tasks
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <Calendar size={40} className="text-sustainPlate-green mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="rounded-full bg-sustainPlate-status-reserved/20 p-2 mr-4">
                <Clock size={24} className="text-sustainPlate-status-reserved" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <h3 className="text-2xl font-bold">{stats.upcoming}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="rounded-full bg-sustainPlate-status-delivered/20 p-2 mr-4">
                <CheckCircle size={24} className="text-sustainPlate-status-delivered" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h3 className="text-2xl font-bold">{stats.completed}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Available Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Tasks</CardTitle>
            <CardDescription>
              Food delivery opportunities in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableTasks.length > 0 ? (
              <div className="space-y-4">
                {getRecentAvailableTasks().map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onAction={() => navigate(`/volunteer/task/${task.id}`)}
                    actionLabel="Sign Up"
                  />
                ))}
                {availableTasks.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/volunteer/available-tasks")}
                  >
                    View All Available Tasks
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No available tasks at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>
              Tasks you're assigned to and completed deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {assignedTasks.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assignedTasks.map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onAction={() => navigate(`/volunteer/task/${task.id}`)}
                        actionLabel={task.status === "assigned" ? "Update Status" : "View Details"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No assigned tasks found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="assigned">
                {assignedTasks.filter(t => t.status === "assigned").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assignedTasks
                      .filter(t => t.status === "assigned")
                      .map((task) => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onAction={() => navigate(`/volunteer/task/${task.id}`)}
                          actionLabel="Update Status"
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No upcoming tasks found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed">
                {assignedTasks.filter(t => t.status === "completed").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assignedTasks
                      .filter(t => t.status === "completed")
                      .map((task) => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onAction={() => navigate(`/volunteer/task/${task.id}`)}
                          actionLabel="View Details"
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No completed tasks found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
