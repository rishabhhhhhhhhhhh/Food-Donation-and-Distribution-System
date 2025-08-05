
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ShoppingBasket, Thermometer } from "lucide-react";
import { Donation } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import DonationCardActions from "./DonationCardActions";

interface DonationCardProps {
  donation: Donation;
  viewType?: "donor" | "ngo" | "volunteer";
}

export default function DonationCard({
  donation,
  viewType = "ngo",
}: DonationCardProps) {
  const statusMap = {
    listed: "Available",
    reserved: "Reserved",
    pickedUp: "Picked Up",
    delivered: "Delivered",
  };

  const statusClasses = {
    listed: "status-listed",
    reserved: "status-reserved",
    pickedUp: "status-pickedUp",
    delivered: "status-delivered",
  };

  const createdAt = new Date(donation.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", 
      donation.status === "listed" ? "border-sustainPlate-status-listed/30" : "",
      donation.status === "reserved" ? "border-sustainPlate-status-reserved/30" : "",
      donation.status === "pickedUp" ? "border-sustainPlate-status-pickedUp/30" : "",
      donation.status === "delivered" ? "border-sustainPlate-status-delivered/30" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl hover:text-sustainPlate-green transition-colors">
            {donation.title}
          </CardTitle>
          <span className={cn("status-badge", statusClasses[donation.status])}>
            {statusMap[donation.status]}
          </span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <span>{donation.donorName}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 line-clamp-2">{donation.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm mb-2">
          <div className="flex items-center gap-2">
            <ShoppingBasket size={16} className="text-sustainPlate-green"/>
            <span>{donation.foodType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-sustainPlate-orange"/>
            <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer size={16} className="text-sustainPlate-status-pickedUp"/>
            <span>{donation.storageRequirements}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-sustainPlate-status-listed"/>
            <span>Pickup location</span>
          </div>
        </div>
        
        <DonationCardActions 
          donation={donation} 
          viewType={viewType} 
        />
      </CardContent>
    </Card>
  );
}
