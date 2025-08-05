
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Donation } from "@/lib/types";
import DonationStatusBadge from "./DonationStatusBadge";
import DonationInfo from "@/components/donations/DonationInfo";
import PickupInfo from "@/components/donations/PickupInfo";

interface DonationDetailsViewProps {
  donation: Donation;
  onEditClick: () => void;
}

export default function DonationDetailsView({ donation, onEditClick }: DonationDetailsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{donation.title}</h1>
        {donation.status === "listed" && (
          <Button onClick={onEditClick}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Donation
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donation Information</CardTitle>
            <div className="flex items-center mt-2">
              <DonationStatusBadge status={donation.status} />
              <span className="text-sm text-muted-foreground ml-4">
                Created {format(new Date(donation.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <DonationInfo donation={donation} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pickup Information</CardTitle>
          </CardHeader>
          <CardContent>
            <PickupInfo donation={donation} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
