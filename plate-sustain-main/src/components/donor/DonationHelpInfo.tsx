
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DonationHelpInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What Happens Next?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          1. Your donation will be listed for NGOs to browse.
        </p>
        <p className="text-sm text-muted-foreground">
          2. An NGO can reserve your donation.
        </p>
        <p className="text-sm text-muted-foreground">
          3. A volunteer will be assigned for pickup.
        </p>
        <p className="text-sm text-muted-foreground">
          4. You'll receive notifications at each step.
        </p>
      </CardContent>
    </Card>
  );
}
