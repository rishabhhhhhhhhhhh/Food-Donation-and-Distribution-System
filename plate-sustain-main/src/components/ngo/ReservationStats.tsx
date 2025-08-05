
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Donation } from "@/lib/types";

interface ReservationStatsProps {
  reservations: Donation[];
  className?: string;
}

export default function ReservationStats({ reservations, className = "" }: ReservationStatsProps) {
  // Count reservations by status
  const reservedCount = reservations.filter(d => d.status === "reserved").length;
  const pickedUpCount = reservations.filter(d => d.status === "pickedUp").length;
  const deliveredCount = reservations.filter(d => d.status === "delivered").length;
  const totalCount = reservations.length;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">Total Reservations</CardTitle>
          <p className="text-3xl font-bold">{totalCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">Awaiting Pickup</CardTitle>
          <p className="text-3xl font-bold">{reservedCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">In Transit</CardTitle>
          <p className="text-3xl font-bold">{pickedUpCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-lg mb-2">Delivered</CardTitle>
          <p className="text-3xl font-bold">{deliveredCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
