import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set, get) => ({
  messages: [],
  messagesGroup: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMessagesGroupLoading: false,
  userSearch: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.arrUser });
      set({ groups: res.data.arrGroup });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  getMessagesGroups: async (userId) => {
    set({ isMessagesGroupLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${userId}`);
      set({ messagesGroup: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesGroupLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  sendMessageGroup: async (messageData) => {
    const { selectedGroup, messagesGroup } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/group${selectedGroup._id}`, messageData);
      set({ messagesGroup: [...messagesGroup, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  searchUser: async (email) => {
    try {
      const res = await axiosInstance.post('/messages/searchUser', email)
      set({ userSearch: res.data })
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    console.log(selectedUser)
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });


  },

  subscribeToMessagesGroup: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
// dang vuong o day, cần nhận được thông báo tin nhăn
    // selectedGroup
    socket.on("newMessageGroup", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });


  },

  subcribeAddFriend: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser

    if (authUser !== null) {
      socket.on("addFriend", (friend) => {
        toast.success(`${friend.fullName} đã gửi lời mời kết bạn!`)
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
}));
