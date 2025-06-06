import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import ProfileFriend from "./pages/ProfileFriend";
import NotifycationPage from "./pages/NotifycationPage";
import RequestFriendPage from "./pages/RequestFriendPage";
import PostDetailPage from "./pages/PostDetailPage";
import ImageDetailPage from "./pages/ImageDetailPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { subcribeAddFriend } = useChatStore();
  const { theme } = useThemeStore();

  const location = useLocation();
  const state = location.state;
  const background = state?.background;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    subcribeAddFriend()
  }, [])

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes location={background || location}>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifycation" element={<NotifycationPage />} />
        <Route path="/request-friend" element={<RequestFriendPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/profile/:email/:id" element={authUser ? <ProfileFriend /> : <Navigate to="/login" />} />
        <Route path="/image/:id" element={<ImageDetailPage />} />
        <Route path="/post/:email/:id/:post/:comment" element={<PostDetailPage />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/post/:email/:id/:post/:comment" element={<PostDetailPage />} />
        </Routes>
      )}

      <Toaster />
    </div>
  );
};
export default App;
