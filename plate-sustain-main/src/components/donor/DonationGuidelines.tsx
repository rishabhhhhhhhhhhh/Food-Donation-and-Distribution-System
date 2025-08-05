
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DonationGuidelines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation Guidelines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Food Quality</h3>
          <p className="text-sm text-muted-foreground">
            Ensure all food is safe for consumption and properly stored.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Packaging</h3>
          <p className="text-sm text-muted-foreground">
            Please package food securely to maintain quality during transport.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Expiry Dates</h3>
          <p className="text-sm text-muted-foreground">
            Be accurate with expiry dates to ensure timely distribution.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Pickup Details</h3>
          <p className="text-sm text-muted-foreground">
            Provide clear pickup instructions to help volunteers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
