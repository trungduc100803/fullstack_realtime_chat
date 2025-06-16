import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import {decryptText} from '../lib/crypto'


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
  highlightedMessageId: null,
  setHighlightedMessageId: (id) => set({ highlightedMessageId: id }),

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
      const messages = res.data.map(m => {
        const text = decryptText(m.text, m.iv);
        m.text = text
        return m
      })
      set({ messages: messages });
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
      const messages = res.data.map(m => {
        const text = decryptText(m.text, m.iv);
        m.text = text
        return m
      })
      set({ messagesGroup: messages });
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
      const text = decryptText(res.data.text, res.data.iv);
      res.data.text = text
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  sendMessageGroup: async (messageData) => {
    const { selectedGroup, messagesGroup } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/group/${selectedGroup._id}`, messageData);
      const text = decryptText(res.data.text, res.data.iv);
      res.data.text = text
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

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const text = decryptText(newMessage.newMessage.text, newMessage.iv);
      newMessage.newMessage.text = text
      const isMessageSentFromSelectedUser = newMessage.newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      
      set({
        messages: [...get().messages, newMessage.newMessage],
      });
    });


  },

  subscribeToMessagesGroup: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    socket.on("newMessageGroup", (newMessage) => {
      const text = decryptText(newMessage.newMessage.text, newMessage.iv);
      newMessage.newMessage.text = text
      if (newMessage.groupId !== selectedGroup._id) return;
      set({
        messagesGroup: [...get().messagesGroup, newMessage.newMessage],
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
  unsubscribeFromMessagesGroup: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessageGroup");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
}));
