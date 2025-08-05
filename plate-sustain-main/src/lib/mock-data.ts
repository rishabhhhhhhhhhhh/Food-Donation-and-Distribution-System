
import { User, Donation, VolunteerTask } from "./types";

// Mock users data
export const users: User[] = [
  {
    id: "u1",
    email: "donor@example.com",
    name: "Fresh Harvest Restaurant",
    role: "donor",
    address: "123 Food St, Culinary City",
    phone: "123-456-7890",
    profileImage: "https://images.unsplash.com/photo-1581349485608-9469926a8e5e?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "u2",
    email: "ngo@example.com",
    name: "Food For All Foundation",
    role: "ngo",
    address: "456 Charity Ave, Hope Town",
    phone: "098-765-4321",
    profileImage: "https://images.unsplash.com/photo-1591522810850-58128c5fb089?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "u3",
    email: "volunteer@example.com",
    name: "Alex Helper",
    role: "volunteer",
    address: "789 Support Rd, Volunteer Village",
    phone: "555-123-4567",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "u4",
    email: "donor2@example.com",
    name: "Green Grocery Market",
    role: "donor",
    address: "234 Veggie Blvd, Fresh City",
    phone: "222-333-4444",
    profileImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: "u5",
    email: "ngo2@example.com",
    name: "Community Meals Project",
    role: "ngo",
    address: "567 Support St, Care City",
    phone: "444-555-6666",
    profileImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=200&auto=format&fit=crop"
  }
];

// Mock donations data
export const donations: Donation[] = [
  {
    id: "d1",
    donorId: "u1",
    donorName: "Fresh Harvest Restaurant",
    title: "Surplus Pasta and Bread",
    description: "Fresh pasta and artisan bread from today's service.",
    foodType: "Prepared Food",
    quantity: "Serves approximately 15 people",
    expiryDate: "2025-04-16", // Tomorrow
    storageRequirements: "Refrigeration required",
    pickupAddress: "123 Food St, Culinary City",
    pickupInstructions: "Please use the back entrance and ask for the manager.",
    status: "listed",
    createdAt: "2025-04-15T10:30:00Z"
  },
  {
    id: "d2",
    donorId: "u4",
    donorName: "Green Grocery Market",
    title: "Fresh Vegetables Bundle",
    description: "Assorted vegetables including carrots, potatoes, and greens.",
    foodType: "Fresh Produce",
    quantity: "5 kg",
    expiryDate: "2025-04-20",
    storageRequirements: "Cool, dry place",
    pickupAddress: "234 Veggie Blvd, Fresh City",
    status: "reserved",
    reservedBy: "u2",
    reservedByName: "Food For All Foundation",
    pickupTime: "2025-04-16T14:00:00Z",
    createdAt: "2025-04-15T09:15:00Z"
  },
  {
    id: "d3",
    donorId: "u1",
    donorName: "Fresh Harvest Restaurant",
    title: "Leftover Catering Meals",
    description: "Boxed meals from a corporate event, variety of options.",
    foodType: "Prepared Food",
    quantity: "20 meal boxes",
    expiryDate: "2025-04-17",
    storageRequirements: "Refrigeration required",
    pickupAddress: "123 Food St, Culinary City",
    status: "pickedUp",
    reservedBy: "u5",
    reservedByName: "Community Meals Project",
    pickupTime: "2025-04-15T16:30:00Z",
    volunteerId: "u3",
    volunteerName: "Alex Helper",
    createdAt: "2025-04-14T18:20:00Z"
  },
  {
    id: "d4",
    donorId: "u4",
    donorName: "Green Grocery Market",
    title: "Fruit Assortment",
    description: "Mixed fruits including apples, bananas, and oranges.",
    foodType: "Fresh Produce",
    quantity: "15 kg",
    expiryDate: "2025-04-18",
    storageRequirements: "Room temperature",
    pickupAddress: "234 Veggie Blvd, Fresh City",
    status: "delivered",
    reservedBy: "u2",
    reservedByName: "Food For All Foundation",
    pickupTime: "2025-04-14T13:00:00Z",
    volunteerId: "u3",
    volunteerName: "Alex Helper",
    createdAt: "2025-04-13T10:45:00Z"
  },
  {
    id: "d5",
    donorId: "u1",
    donorName: "Fresh Harvest Restaurant",
    title: "Soup and Sandwiches",
    description: "Vegetable soup and assorted sandwiches.",
    foodType: "Prepared Food",
    quantity: "Serves approximately 10 people",
    expiryDate: "2025-04-16",
    storageRequirements: "Refrigeration required",
    pickupAddress: "123 Food St, Culinary City",
    status: "listed",
    createdAt: "2025-04-15T11:45:00Z"
  }
];

// Mock volunteer tasks
export const volunteerTasks: VolunteerTask[] = [
  {
    id: "t1",
    donationId: "d2",
    donationTitle: "Fresh Vegetables Bundle",
    pickupAddress: "234 Veggie Blvd, Fresh City",
    deliveryAddress: "456 Charity Ave, Hope Town",
    pickupTime: "2025-04-16T14:00:00Z",
    status: "available"
  },
  {
    id: "t2",
    donationId: "d3",
    donationTitle: "Leftover Catering Meals",
    pickupAddress: "123 Food St, Culinary City",
    deliveryAddress: "567 Support St, Care City",
    pickupTime: "2025-04-15T16:30:00Z",
    status: "assigned",
    volunteerId: "u3",
    volunteerName: "Alex Helper"
  },
  {
    id: "t3",
    donationId: "d4",
    donationTitle: "Fruit Assortment",
    pickupAddress: "234 Veggie Blvd, Fresh City",
    deliveryAddress: "456 Charity Ave, Hope Town",
    pickupTime: "2025-04-14T13:00:00Z",
    status: "completed",
    volunteerId: "u3",
    volunteerName: "Alex Helper"
  }
];
