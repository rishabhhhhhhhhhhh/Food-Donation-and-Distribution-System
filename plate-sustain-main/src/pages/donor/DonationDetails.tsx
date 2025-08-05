
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DonationEditForm from "@/components/donations/DonationEditForm";
import DonationDetailsView from "@/components/donor/DonationDetailsView";
import { useDonationDetails } from "@/hooks/useDonationDetails";

export default function DonationDetails() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "donor") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { data: donation, isLoading, error, refetch } = useDonationDetails(id, currentUser);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleDonationUpdated = () => {
    setIsEditing(false);
    refetch();
    toast({
      title: "Donation updated",
      description: "Your donation has been updated successfully",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !donation) {
    return (
      <Layout>
        <div className="container py-8">
          <h1 className="text-xl font-medium text-center text-muted-foreground">
            Donation not found or you do not have permission to view it
          </h1>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate("/donor/donations")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Donations
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate("/donor/donations")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Donations
        </Button>

        {isEditing ? (
          <DonationEditForm 
            donation={donation} 
            onDonationUpdated={handleDonationUpdated}
          />
        ) : (
          <DonationDetailsView 
            donation={donation} 
            onEditClick={handleEditToggle}
          />
        )}
      </div>
    </Layout>
  );
}
