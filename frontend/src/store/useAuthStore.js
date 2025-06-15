// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios.js";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";

// // const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
// const LAN_SOCKET_URL = "http://192.168.1.10:5000"; // 👈 Địa chỉ IP LAN
// const INTERNET_SOCKET_URL = import.meta.env.MODE === "development"
//   ? "http://localhost:5001"
//   : "/";

// const BASE_URL = navigator.onLine ? INTERNET_SOCKET_URL : LAN_SOCKET_URL;


// // exp
// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios.js";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";

// const LAN_SOCKET_URL = "http://192.168.1.10:5000";
// const INTERNET_SOCKET_URL = import.meta.env.MODE === "development"
//   ? "http://localhost:5001"
//   : "/";

// const BASE_URL = navigator.onLine ? INTERNET_SOCKET_URL : LAN_SOCKET_URL;

// export const useAuthStore = create((set, get) => ({
//   authUser: null,
//   isSigningUp: false,
//   isLoggingIn: false,
//   isUpdatingProfile: false,
//   isCheckingAuth: true,
//   onlineUsers: [],
//   socket: null,

//   checkAuth: async () => {
//     try {
//       const res = await axiosInstance.get("/auth/check");
//       set({ authUser: res.data });
//       get().connectSocket();
//     } catch (error) {
//       const offlineUser = localStorage.getItem("authUser");
//       if (offlineUser) {
//         const parsedUser = JSON.parse(offlineUser);
//         set({ authUser: parsedUser });
//         get().connectSocket();
//         toast.success("Đăng nhập offline");
//       } else {
//         set({ authUser: null });
//       }
//     } finally {
//       set({ isCheckingAuth: false });
//     }
//   },

//   signup: async (data) => {
//     set({ isSigningUp: true });
//     try {
//       const res = await axiosInstance.post("/auth/signup", data);
//       set({ authUser: res.data });
//       localStorage.setItem("authUser", JSON.stringify(res.data));
//       toast.success("Account created successfully");
//       get().connectSocket();
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isSigningUp: false });
//     }
//   },

//   login: async (data) => {
//     set({ isLoggingIn: true });
//     try {
//       const res = await axiosInstance.post("/auth/login", data);
//       set({ authUser: res.data });
//       localStorage.setItem("authUser", JSON.stringify(res.data));
//       toast.success("Logged in successfully");
//       get().connectSocket();
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isLoggingIn: false });
//     }
//   },

//   logout: async () => {
//     try {
//       await axiosInstance.post("/auth/logout");
//       localStorage.removeItem("authUser");
//       set({ authUser: null });
//       toast.success("Logged out successfully");
//       get().disconnectSocket();
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   },

//   updateProfile: async (data) => {
//     set({ isUpdatingProfile: true });
//     try {
//       const res = await axiosInstance.put("/auth/update-profile", data);
//       set({ authUser: res.data });
//       toast.success("Profile updated successfully");
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isUpdatingProfile: false });
//     }
//   },

//   connectSocket: () => {
//     const { authUser } = get();
//     if (!authUser || get().socket?.connected) return;

//     const socket = io(BASE_URL, {
//       transports: ['websocket'],
//       query: {
//         userId: authUser._id,
//       },
//     });

//     socket.connect();
//     set({ socket });

//     socket.on("getOnlineUsers", (userIds) => {
//       set({ onlineUsers: userIds });
//     });

//     authUser.groups?.forEach((group) => {
//       socket.emit("joinGroup", group);
//     });
//   },

//   disconnectSocket: () => {
//     if (get().socket?.connected) get().socket.disconnect();
//   },
// }));
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const LAN_SOCKET_URL = "http://192.168.1.10:5000";
const INTERNET_SOCKET_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001"
  : "/";

const BASE_URL = navigator.onLine ? INTERNET_SOCKET_URL : LAN_SOCKET_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      const offlineUser = localStorage.getItem("authUser");
      if (offlineUser) {
        set({ authUser: JSON.parse(offlineUser) });
  get().connectSocket();
  toast.success("Đăng nhập offline");
      } else {
        set({ authUser: null });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // login: async (data) => {
  //   set({ isLoggingIn: true });
  //   try {
  //     const res = await axiosInstance.post("/auth/login", data);
  //     set({ authUser: res.data });
  //     localStorage.setItem("authUser", JSON.stringify(res.data));
  //     toast.success("Logged in successfully");
  //     get().connectSocket();
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   } finally {
  //     set({ isLoggingIn: false });
  //   }
  // },
  login: async (data) => {
    set({ isLoggingIn: true });
  
    const isOffline = !navigator.onLine;
  
    if (isOffline) {
      // 👇 THÊM: login offline nếu trùng email đã lưu
      const backupUser = localStorage.getItem("offlineBackupUser");

if (backupUser) {
  const parsed = JSON.parse(backupUser);
  if (parsed.email === data.email) {
    set({ authUser: parsed });
    toast.success("Đăng nhập offline");
    get().connectSocket();
  } else {
    toast.error("Tài khoản chưa từng đăng nhập trước đó");
  }
} else {
  toast.error("Chưa có dữ liệu để đăng nhập offline");
}
  
      set({ isLoggingIn: false });
      return;
    }
  
    // ✅ Bình thường (online) sẽ login qua server
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log(res.data.token);
      set({ authUser: res.data });
      localStorage.setItem("offlineToken", res.data.token);
      localStorage.setItem("authUser", JSON.stringify(res.data)); // session
      localStorage.setItem("offlineBackupUser", JSON.stringify(res.data)); // để login offline
      toast.success("Đăng nhập thành công");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("authUser"); // ❗️ KHÔNG xoá backup
set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      transports: ['websocket'],
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    authUser.groups?.forEach((group) => {
      socket.emit("joinGroup", group);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
