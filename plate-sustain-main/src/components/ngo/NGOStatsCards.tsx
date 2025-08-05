
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBasket, Package, Truck, Check } from "lucide-react";

interface NGOStatsCardsProps {
  total: number;
  pending: number;
  pickups: number;
  received: number;
}

export default function NGOStatsCards({ total, pending, pickups, received }: NGOStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <Card>
        <CardContent className="flex flex-row items-center p-6">
          <ShoppingBasket size={40} className="text-sustainPlate-green mr-4" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Reservations</p>
            <h3 className="text-2xl font-bold">{total}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-row items-center p-6">
          <div className="rounded-full bg-sustainPlate-status-reserved/20 p-2 mr-4">
            <Package size={24} className="text-sustainPlate-status-reserved" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Pickup</p>
            <h3 className="text-2xl font-bold">{pending}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-row items-center p-6">
          <div className="rounded-full bg-sustainPlate-status-pickedUp/20 p-2 mr-4">
            <Truck size={24} className="text-sustainPlate-status-pickedUp" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">In Transit</p>
            <h3 className="text-2xl font-bold">{pickups}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-row items-center p-6">
          <div className="rounded-full bg-sustainPlate-status-delivered/20 p-2 mr-4">
            <Check size={24} className="text-sustainPlate-status-delivered" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Received</p>
            <h3 className="text-2xl font-bold">{received}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
