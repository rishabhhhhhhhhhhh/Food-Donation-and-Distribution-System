
import { useEffect } from "react";
import Layout from "@/components/Layout";
import DonationForm from "@/components/donations/DonationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Donation } from "@/lib/types";
import DonationGuidelines from "@/components/donor/DonationGuidelines";
import DonationHelpInfo from "@/components/donor/DonationHelpInfo";

export default function CreateDonation() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "donor") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleDonationCreated = (donation: Donation) => {
    navigate("/donor/donations");
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Create a Donation</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Donation Details</CardTitle>
                <CardDescription>
                  Provide information about the food you want to donate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonationForm onDonationCreated={handleDonationCreated} />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <DonationGuidelines />
            <DonationHelpInfo />
          </div>
        </div>
      </div>
    </Layout>
  );
}
