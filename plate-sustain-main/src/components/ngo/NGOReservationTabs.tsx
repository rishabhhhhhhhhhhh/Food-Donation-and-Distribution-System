
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DonationCard from "@/components/donations/DonationCard";
import { Donation } from "@/lib/types";

interface NGOReservationTabsProps {
  reservations: Donation[];
}

export default function NGOReservationTabs({ reservations }: NGOReservationTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Reservations</CardTitle>
        <CardDescription>
          Track the status of your food reservations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="reserved">Pending Pickup</TabsTrigger>
            <TabsTrigger value="pickedUp">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Received</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {reservations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reservations.map((donation) => (
                  <DonationCard 
                    key={donation.id} 
                    donation={donation} 
                    viewType="ngo"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reservations found</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="reserved">
            {reservations.filter(d => d.status === "reserved").length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reservations
                  .filter(d => d.status === "reserved")
                  .map((donation) => (
                    <DonationCard 
                      key={donation.id} 
                      donation={donation} 
                      viewType="ngo"
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending pickups found</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="pickedUp">
            {reservations.filter(d => d.status === "pickedUp").length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reservations
                  .filter(d => d.status === "pickedUp")
                  .map((donation) => (
                    <DonationCard 
                      key={donation.id} 
                      donation={donation} 
                      viewType="ngo"
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No in-transit donations found</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="delivered">
            {reservations.filter(d => d.status === "delivered").length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reservations
                  .filter(d => d.status === "delivered")
                  .map((donation) => (
                    <DonationCard 
                      key={donation.id} 
                      donation={donation} 
                      viewType="ngo"
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No received donations found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
