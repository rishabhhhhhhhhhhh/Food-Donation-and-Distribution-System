
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DonationFormValues = z.infer<typeof DonationFormSchema>;

interface DonationDetailedInfoProps {
  form: UseFormReturn<DonationFormValues>;
}

export default function DonationDetailedInfo({ form }: DonationDetailedInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Food Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="foodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select food type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Prepared Food">Prepared Food</SelectItem>
                  <SelectItem value="Fresh Produce">Fresh Produce</SelectItem>
                  <SelectItem value="Bakery Items">Bakery Items</SelectItem>
                  <SelectItem value="Canned Goods">Canned Goods</SelectItem>
                  <SelectItem value="Dairy Products">Dairy Products</SelectItem>
                  <SelectItem value="Meat/Protein">Meat/Protein</SelectItem>
                  <SelectItem value="Mixed Items">Mixed Items</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 5kg, Serves 10 people"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storageRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Requirements</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage requirements" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Room temperature">Room temperature</SelectItem>
                  <SelectItem value="Refrigeration required">Refrigeration required</SelectItem>
                  <SelectItem value="Freezing required">Freezing required</SelectItem>
                  <SelectItem value="Cool, dry place">Cool, dry place</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
