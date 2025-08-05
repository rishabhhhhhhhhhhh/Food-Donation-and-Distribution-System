
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Donation } from "@/lib/types";
import { useDonationUpdates } from "@/hooks/useDonationUpdates";
import DonationCard from "@/components/donations/DonationCard";
import { Plus, ChevronRight, Info, ShoppingBasket, Clock } from "lucide-react";

export default function DonorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const donations = useDonationUpdates(currentUser?.id || '');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    reserved: 0,
    delivered: 0,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "donor") {
      navigate("/login");
      return;
    }

    // Calculate stats
    setStats({
      total: donations.length,
      active: donations.filter((d) => d.status === "listed").length,
      reserved: donations.filter((d) => d.status === "reserved" || d.status === "pickedUp").length,
      delivered: donations.filter((d) => d.status === "delivered").length,
    });
  }, [currentUser, navigate, donations]);

  const getRecentDonations = () => {
    return donations.slice(0, 3);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Donor Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your food donations and track their status
            </p>
          </div>
          <Button 
            onClick={() => navigate("/donor/create-donation")}
            className="mt-4 md:mt-0 bg-sustainPlate-green hover:bg-sustainPlate-green-dark"
          >
            <Plus size={16} className="mr-2" />
            Create Donation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <ShoppingBasket size={40} className="text-sustainPlate-green mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="rounded-full bg-sustainPlate-status-listed/20 p-2 mr-4">
                <Info size={24} className="text-sustainPlate-status-listed" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <h3 className="text-2xl font-bold">{stats.active}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="rounded-full bg-sustainPlate-status-reserved/20 p-2 mr-4">
                <Clock size={24} className="text-sustainPlate-status-reserved" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reserved</p>
                <h3 className="text-2xl font-bold">{stats.reserved}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center p-6">
              <div className="rounded-full bg-sustainPlate-status-delivered/20 p-2 mr-4">
                <ShoppingBasket size={24} className="text-sustainPlate-status-delivered" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <h3 className="text-2xl font-bold">{stats.delivered}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Donations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>
              Your most recent food donation listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length > 0 ? (
              <div className="space-y-4">
                {getRecentDonations().map((donation) => (
                  <DonationCard 
                    key={donation.id} 
                    donation={donation} 
                    viewType="donor"
                  />
                ))}
                {donations.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/donor/donations")}
                  >
                    View All Donations
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">You haven't created any donations yet</p>
                <Button
                  onClick={() => navigate("/donor/create-donation")}
                  className="bg-sustainPlate-green hover:bg-sustainPlate-green-dark"
                >
                  <Plus size={16} className="mr-2" />
                  Create Your First Donation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Status</CardTitle>
            <CardDescription>
              Track the status of all your donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="listed">Listed</TabsTrigger>
                <TabsTrigger value="reserved">Reserved</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {donations.length > 0 ? (
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
                    <p className="text-muted-foreground">No donations found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="listed">
                {donations.filter(d => d.status === "listed").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {donations
                      .filter(d => d.status === "listed")
                      .map((donation) => (
                        <DonationCard 
                          key={donation.id} 
                          donation={donation} 
                          viewType="donor"
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active listings found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="reserved">
                {donations.filter(d => d.status === "reserved" || d.status === "pickedUp").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {donations
                      .filter(d => d.status === "reserved" || d.status === "pickedUp")
                      .map((donation) => (
                        <DonationCard 
                          key={donation.id} 
                          donation={donation} 
                          viewType="donor"
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reserved donations found</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="delivered">
                {donations.filter(d => d.status === "delivered").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {donations
                      .filter(d => d.status === "delivered")
                      .map((donation) => (
                        <DonationCard 
                          key={donation.id} 
                          donation={donation} 
                          viewType="donor"
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No delivered donations found</p>
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
