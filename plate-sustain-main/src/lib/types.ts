
export type UserRole = "donor" | "ngo" | "volunteer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  address?: string;
  phone?: string;
  profileImage?: string;
}

export type DonationStatus = "listed" | "reserved" | "pickedUp" | "delivered";

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  title: string;
  description: string;
  foodType: string;
  quantity: string;
  expiryDate: string;
  storageRequirements: string;
  pickupAddress: string;
  pickupInstructions?: string;
  status: DonationStatus;
  createdAt: string;
  reservedBy?: string;
  reservedByName?: string;
  pickupTime?: string;
  volunteerId?: string;
  volunteerName?: string;
}

export interface VolunteerTask {
  id: string;
  donationId: string;
  donationTitle: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupTime: string;
  status: "available" | "assigned" | "completed";
  volunteerId?: string;
  volunteerName?: string;
}
