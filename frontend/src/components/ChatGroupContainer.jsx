import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { FileText, Download } from "lucide-react";

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
              {message.file ? (
              // <a
              //   href={message.file}
              //   target="_blank"
              //   rel="noopener noreferrer"
              //   className="text-blue-500 underline"
              // >
              //   📎 {message.fileName} File
              // </a>
              <FileAttachment
                name={message.fileName}
                size={message.fileSize}
                url={message.file}
              />
            ) : (
             <></>
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

const FileAttachment = ({ name, size, url }) => {
  const getFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-zinc-800 text-white px-4 py-3 rounded-xl max-w-xs w-fit flex items-center gap-3 shadow-md border border-zinc-600">
      <FileText className="text-blue-400" size={24} />
      <div className="flex-1 min-w-0">
        <a
          href={url}
          download
          className="text-blue-400 font-medium hover:underline break-all block"
        >
          {name}
        </a>
        <div className="text-sm text-zinc-400">{getFileSize(size)}</div>
      </div>
      <a href={url} download className="ml-2">
        <Download size={20} className="text-zinc-400 hover:text-white" />
      </a>
    </div>
  );
};