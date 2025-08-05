
import { Donation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface DonationStatusBadgeProps {
  status: Donation["status"];
}

export default function DonationStatusBadge({ status }: DonationStatusBadgeProps) {
  const getStatusBadgeColor = (status: Donation["status"]) => {
    switch (status) {
      case "listed":
        return "bg-blue-500";
      case "reserved":
        return "bg-yellow-500";
      case "pickedUp":
        return "bg-green-500";
      case "delivered":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Badge className={getStatusBadgeColor(status)}>
      {status === "listed" ? "Available" :
       status === "reserved" ? "Reserved" :
       status === "pickedUp" ? "Picked Up" : "Delivered"}
    </Badge>
  );
}
