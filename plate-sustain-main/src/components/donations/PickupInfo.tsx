
import { AlertCircle, MapPin } from "lucide-react";
import { Donation } from "@/lib/types";

interface PickupInfoProps {
  donation: Donation;
}

export default function PickupInfo({ donation }: PickupInfoProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Pickup Information</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-sustainPlate-status-listed mt-1" />
          <div>
            <p className="font-medium">Address</p>
            <p>{donation.pickupAddress}</p>
          </div>
        </div>
        {donation.pickupInstructions && (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-1" />
            <div>
              <p className="font-medium">Instructions</p>
              <p>{donation.pickupInstructions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
