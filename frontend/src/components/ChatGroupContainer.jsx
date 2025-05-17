import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
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

  const getUser = async (message) => {
            const res = await axiosInstance.get(`/messages/getUser/${message.senderId}`)
            .then(res => {setSender(res.data.user)});
          }

  if (isMessagesGroupLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        {/* <ChatHeader /> */}
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* <ChatHeader /> */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesGroup.map((message) => {
          // getUser(message)
          // console.log(sender)
          return <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedGroup.image || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
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

      <MessageInput />
    </div>
  );
};
export default ChatGroupContainer;
