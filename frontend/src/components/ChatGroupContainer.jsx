import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeaderGroup from "./ChatHeaderGroup";
import MessageGroupInput from "./MessageGroupInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Image } from 'antd'
import { axiosInstance } from "../lib/axios";

const ChatGroupContainer = () => {
  const {
    messagesGroup,
    getMessagesGroups,
    isMessagesGroupLoading,
    selectedGroup,
    subscribeToMessagesGroup,
    unsubscribeFromMessagesGroup,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [sender, setSender] = useState(null)

  useEffect(() => {
    getMessagesGroups(selectedGroup._id);

    subscribeToMessagesGroup();

    return () => unsubscribeFromMessagesGroup();
  }, [selectedGroup._id, getMessagesGroups, subscribeToMessagesGroup, unsubscribeFromMessagesGroup]);

  useEffect(() => {
    if (messageEndRef.current && messagesGroup) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesGroup]);

  if (isMessagesGroupLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeaderGroup />
        <MessageSkeleton />
        <MessageGroupInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeaderGroup />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesGroup.map((message) => {
          return <div
            key={message._id}
            className={`chat ${message.senderId._id === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className={message.senderId._id === authUser._id
              ? " chat-image avatar flex flex-col items-end"
              : " chat-image avatar flex flex-col items-start"} >
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId._id === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : message.senderId.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
              <p className="text-sm opacity-50">{message.senderId._id === authUser._id
                ? authUser.fullName
                : message.senderId.fullName}</p>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <Image
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        })}
      </div>

      <MessageGroupInput />
    </div>
  );
};
export default ChatGroupContainer;
