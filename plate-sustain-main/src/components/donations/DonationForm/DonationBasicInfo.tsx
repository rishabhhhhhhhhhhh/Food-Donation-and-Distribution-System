
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

interface DonationBasicInfoProps {
  form: UseFormReturn<DonationFormValues>;
}

export default function DonationBasicInfo({ form }: DonationBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Basic Information</h2>
      
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Fresh Bread and Pastries" {...field} />
            </FormControl>
            <FormDescription>
              A short title describing the food donation
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide more details about the food donation"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Include details about the food items and any relevant information
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
