
import Layout from "@/components/Layout";
import { Info } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="container py-12 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Info size={32} className="text-sustainPlate-green" />
          <h1 className="text-3xl font-bold">About SustainPlate</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-4">
          SustainPlate is a platform dedicated to reducing food waste and fighting hunger by connecting donors, NGOs, and volunteers.
        </p>
        <div className="mb-4">
          <h2 className="font-semibold text-xl mb-2">Our Mission</h2>
          <p>
            We bridge the gap between those with surplus food and those in need, supporting communities and the environment.
          </p>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-xl mb-2">How it Works</h2>
          <ul className="list-disc ml-6 text-muted-foreground space-y-1">
            <li>Donors list surplus food through our platform.</li>
            <li>NGOs reserve food for their communities with a click.</li>
            <li>Volunteers coordinate delivery and pickup as needed.</li>
          </ul>
        </div>
        <p className="text-muted-foreground mt-6">Together, we create a future with less waste and more full plates.</p>
      </div>
    </Layout>
  );
}
