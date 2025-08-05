
export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  related_id?: string;
  related_type?: string;
}
