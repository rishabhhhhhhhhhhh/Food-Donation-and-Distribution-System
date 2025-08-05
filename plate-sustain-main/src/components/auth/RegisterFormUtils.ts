
import { z } from "zod";

export const registerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["donor", "ngo", "volunteer"], {
    required_error: "Please select a role.",
  }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const roleOptions = [
  { label: "Food Donor", value: "donor", description: "I want to donate food" },
  { label: "NGO / Food Bank", value: "ngo", description: "I represent an organization that distributes food" },
  { label: "Volunteer", value: "volunteer", description: "I want to help with food delivery" },
];

export const getRoleDescription = (role: string) => {
  switch (role) {
    case "donor":
      return "As a donor, you can list food items that would otherwise go to waste.";
    case "ngo":
      return "As an NGO, you can browse and reserve available food donations.";
    case "volunteer":
      return "As a volunteer, you can help deliver food from donors to NGOs.";
    default:
      return "";
  }
};
