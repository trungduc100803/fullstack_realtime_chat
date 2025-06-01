import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/notifications");
            set({ notifications: res.data });
        } catch (err) {
            console.error("❌ fetchNotifications:", err);
        } finally {
            set({ isLoading: false });
        }
    },

    markNotificationAsRead: async (id) => {
        try {
            await axiosInstance.put(`/notifications/read/${id}`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
            }));
            set({ isNotify: true });
        } catch (err) {
            console.error("❌ markNotificationAsRead:", err);
        }
    },

    subscribeToNotifications: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.on("newNotification", (notification) => {
            toast.success("🔔 Bạn có thông báo mới!");
            set((state) => ({
                notifications: [notification, ...state.notifications],
            }));
        });
    },
}));
