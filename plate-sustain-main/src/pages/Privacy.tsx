
import Layout from "@/components/Layout";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <div className="container py-12 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={32} className="text-sustainPlate-green" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-4">
          Your privacy matters to us. Here’s how we collect, use, and protect your information.
        </p>
        <div className="mb-4">
          <h2 className="font-semibold text-xl mb-2">Information We Collect</h2>
          <p>
            We collect only the information needed to operate SustainPlate: your login email, name, and participation details as a donor, NGO, or volunteer.
          </p>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-xl mb-2">How We Use Your Data</h2>
          <p>
            Your data is used strictly for connecting donations, reservations, and volunteer activities. We don't sell or share your details with outside parties.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-xl mb-2">Questions?</h2>
          <p>
            Contact us at <a href="mailto:plate.sustain@gmail.com" className="text-sustainPlate-green underline">plate.sustain@gmail.com</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
