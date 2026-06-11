import { useState } from 'react';
import type { Notification } from '../index';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const updateNotification = async (id: string, updates: Partial<Notification>) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
      }
    } catch (err) {
      console.error("Failed to update notification", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const createNotification = async (notif: Omit<Notification, 'id' | 'status' | 'timestamp'>) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(notif),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error("Failed to create notification", err);
    }
  };

  return { notifications, setNotifications, updateNotification, deleteNotification, createNotification };
};
