
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ProfileFormValues = {
  name: string;
  address: string;
  phone: string;
};

export default function ProfileEditForm() {
  const { currentUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    defaultValues: {
      name: currentUser?.name || "",
      address: currentUser?.address || "",
      phone: currentUser?.phone || "",
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser?.id);

      if (error) {
        throw error;
      }

      await refreshUser();
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-sm font-medium text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Your address"
            {...register("address")}
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="Your phone number"
            {...register("phone")}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
