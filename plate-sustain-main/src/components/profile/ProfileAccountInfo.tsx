
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileAccountInfo() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Email</p>
        <p>{currentUser?.email}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Role</p>
        <p className="capitalize">{currentUser?.role}</p>
      </div>
    </div>
  );
}
