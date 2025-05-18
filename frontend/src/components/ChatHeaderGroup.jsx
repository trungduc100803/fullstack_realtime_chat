import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Link } from "react-router-dom";

const ChatHeaderGroup = () => {
  const { selectedGroup, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Link to={`/profile/${selectedGroup._id}`}>
            <div className="avatar cursor-pointer">
              <div className="size-10 rounded-full relative">
                <img src={selectedGroup.image || "/avatar.png"} alt={selectedGroup.name} />
              </div>
            </div>
          </Link>

          {/* Group info */}
          <div>
            <h3 className="font-medium">{selectedGroup.name}</h3>
            {/* <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedGroup._id) ? "Online" : "Offline"}
            </p> */}
          </div>
        </div>

        {/* user profile */}

        {/* Close button */}
        <button onClick={() => setSelectedGroup(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeaderGroup;
