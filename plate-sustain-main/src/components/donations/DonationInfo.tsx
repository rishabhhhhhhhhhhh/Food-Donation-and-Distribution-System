
import { Calendar, Package, Thermometer } from "lucide-react";
import { Donation } from "@/lib/types";

interface DonationInfoProps {
  donation: Donation;
}

export default function DonationInfo({ donation }: DonationInfoProps) {
  const expiryDate = new Date(donation.expiryDate);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Food Details</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-sustainPlate-green" />
          <div>
            <p className="font-medium">Food Type</p>
            <p>{donation.foodType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-sustainPlate-orange" />
          <div>
            <p className="font-medium">Quantity</p>
            <p>{donation.quantity}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium">Expiry Date</p>
            <p>{expiryDate.toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-sustainPlate-status-pickedUp" />
          <div>
            <p className="font-medium">Storage Requirements</p>
            <p>{donation.storageRequirements}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
