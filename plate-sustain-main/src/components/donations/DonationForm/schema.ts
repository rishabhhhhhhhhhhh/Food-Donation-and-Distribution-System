
import { z } from "zod";

export const DonationFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  foodType: z.string().min(1, { message: "Please select a food type" }),
  quantity: z.string().min(1, { message: "Please provide quantity information" }),
  expiryDate: z.string().min(1, { message: "Please provide expiry date" }),
  storageRequirements: z.string().min(1, { message: "Please provide storage requirements" }),
  pickupAddress: z.string().min(5, { message: "Please provide pickup address" }),
  pickupInstructions: z.string().optional(),
});
