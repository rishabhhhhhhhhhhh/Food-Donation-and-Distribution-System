
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Donation } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { DonationFormSchema } from "./schema";
import DonationBasicInfo from "./DonationBasicInfo";
import DonationDetailedInfo from "./DonationDetailedInfo";
import DonationPickupInfo from "./DonationPickupInfo";

type DonationFormValues = z.infer<typeof DonationFormSchema>;

interface DonationFormProps {
  onDonationCreated?: (donation: Donation) => void;
}

export default function DonationForm({ onDonationCreated }: DonationFormProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(DonationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      foodType: "",
      quantity: "",
      expiryDate: new Date().toISOString().split("T")[0],
      storageRequirements: "",
      pickupAddress: currentUser?.address || "",
      pickupInstructions: "",
    },
  });

  const onSubmit = async (values: DonationFormValues) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to create a donation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting donation:", values);
      
      // Save donation to Supabase
      const { data, error } = await supabase
        .from("donations")
        .insert({
          donor_id: currentUser.id,
          title: values.title,
          description: values.description,
          food_type: values.foodType,
          quantity: values.quantity,
          expiry_date: new Date(values.expiryDate).toISOString(),
          storage_requirements: values.storageRequirements,
          pickup_address: values.pickupAddress,
          pickup_instructions: values.pickupInstructions,
          status: "listed"
        })
        .select()
        .single();
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Donation created successfully:", data);
      
      toast({
        title: "Donation created",
        description: "Your food donation has been listed successfully",
      });

      // Convert database format to application format
      const newDonation: Donation = {
        id: data.id,
        donorId: data.donor_id,
        donorName: currentUser.name,
        title: data.title,
        description: data.description || "",
        foodType: data.food_type,
        quantity: data.quantity,
        expiryDate: data.expiry_date,
        storageRequirements: data.storage_requirements || "Room temperature",
        pickupAddress: data.pickup_address,
        pickupInstructions: data.pickup_instructions || "",
        status: data.status as Donation["status"],
        createdAt: data.created_at || new Date().toISOString(),
      };

      if (onDonationCreated) {
        onDonationCreated(newDonation);
      } else {
        navigate("/donor/donations");
      }
    } catch (error) {
      toast({
        title: "Error creating donation",
        description: "There was an error creating your donation. Please try again.",
        variant: "destructive",
      });
      console.error("Donation creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DonationBasicInfo form={form} />
        <DonationDetailedInfo form={form} />
        <DonationPickupInfo form={form} />

        <Button
          type="submit"
          className="w-full md:w-auto bg-sustainPlate-green hover:bg-sustainPlate-green-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating donation...
            </>
          ) : (
            "Create Donation"
          )}
        </Button>
      </form>
    </Form>
  );
}
