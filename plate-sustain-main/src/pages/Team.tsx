
import Layout from "@/components/Layout";
import { User } from "lucide-react";

const teamMembers = [
  { name: "Naman Gupta" },
  { name: "Karan Singh" },
  { name: "Gagan Singh" },
  { name: "Rishabh Garg" },
];

export default function Team() {
  return (
    <Layout>
      <div className="container py-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <User size={32} className="text-sustainPlate-green" />
          <h1 className="text-3xl font-bold">Our Team</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center bg-sustainPlate-beige/50 p-6 rounded-md shadow">
              <div className="w-24 h-24 mb-3 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {/* Placeholder icon, replace with image later */}
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-lg font-semibold">{member.name}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
