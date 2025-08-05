
import Layout from "@/components/Layout";
import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <div className="container py-12 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Mail size={32} className="text-sustainPlate-green" />
          <h1 className="text-3xl font-bold">Contact Us</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8">
          We'd love to hear from you—whether you have questions, partnership ideas, or want to get involved.
        </p>
        <div className="bg-sustainPlate-beige/50 p-6 rounded-md shadow">
          <h2 className="font-semibold text-xl mb-2">Send us a message</h2>
          <ul className="list-disc ml-6 text-muted-foreground space-y-1 mb-4">
            <li>Email: <a href="mailto:plate.sustain@gmail.com" className="text-sustainPlate-green hover:underline">plate.sustain@gmail.com</a></li>
            <li>Address: Thapar Institute of Engineering & Technology, Patiala</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
