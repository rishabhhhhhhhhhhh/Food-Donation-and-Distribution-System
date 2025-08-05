
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { DonationFormSchema } from "./schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DonationFormValues = z.infer<typeof DonationFormSchema>;

interface DonationPickupInfoProps {
  form: UseFormReturn<DonationFormValues>;
}

export default function DonationPickupInfo({ form }: DonationPickupInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Pickup Information</h2>
      
      <FormField
        control={form.control}
        name="pickupAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pickup Address</FormLabel>
            <FormControl>
              <Input placeholder="Full address for pickup" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pickupInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pickup Instructions (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any specific instructions for pickup"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Include parking information, entry details, or contact person
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
