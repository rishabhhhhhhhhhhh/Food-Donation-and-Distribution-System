
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { toast } from "@/components/ui/use-toast";

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        
        setNotifications(data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          message: item.message,
          isRead: item.is_read,
          createdAt: item.created_at,
          related_id: item.related_id,
          related_type: item.related_type
        })));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel("public:notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newNotification = {
          id: payload.new.id,
          userId: payload.new.user_id,
          message: payload.new.message,
          isRead: payload.new.is_read,
          createdAt: payload.new.created_at,
          related_id: payload.new.related_id,
          related_type: payload.new.related_type
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        
        toast({
          title: "New Notification",
          description: payload.new.message,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
        
      if (error) throw error;
          
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
        
      if (error) throw error;
        
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return { notifications, loading, markAsRead, markAllAsRead };
}
