import { useNotificationStore } from "../store/useNotificationStore";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Link, useLocation } from "react-router-dom";

export default function NotifycationPage() {
    const {
        notifications,
        fetchNotifications,
        isLoading,
        subscribeToNotifications,
        markNotificationAsRead,
    } = useNotificationStore();
    const location = useLocation();


    useEffect(() => {
        fetchNotifications();
        subscribeToNotifications();
    }, []);

    const renderText = (n) => {
        switch (n.type) {
            case "new_post":
                return "vừa đăng một bài viết mới.";
            case "new_comment":
                return "đã bình luận vào bài viết của bạn.";
            case "reply_comment":
                return "đã trả lời bình luận của bạn.";
            default:
                return "có hoạt động mới.";
        }
    };

    return (
        <div className="h-screen pt-20">
            <p className="text-2xl mx-auto max-w-6xl font-bold mb-8">Thông báo</p>

            <div className="profile bg-base-300 max-w-6xl  mx-auto p-4 py-8 mt-2 rounded-xl h-3/4 overflow-auto">
                {isLoading ? (
                    <p>Đang tải...</p>
                ) : notifications.length === 0 ? (
                    <p>Không có thông báo</p>
                ) : (
                    notifications.map((n) => {
                        console.log(n.type)
                        n && n.type == 'new_comment' || 'reply_comment' ?
                            <div key={n._id} className={`flex w-full items-center hover:bg-base-200 rounded pl-3 pr-3 ${!n.isRead ? "bg-base-100" : ""}`}>
                                <img
                                    src={n.sender.profilePic || "/avatar.png"}
                                    alt={n.sender.fullName}

                                    className="size-12 object-cover rounded-full"
                                />
                                <div className={`p-2 flex flex-1   cursor-pointer `}>

                                    <Link
                                        // to={`/post/${n.sender.email}/${n.sender._id}/${n.post._id}/${n.comment._id}`}
                                        state={{ background: location }}
                                        onClick={() => markNotificationAsRead(n._id)}
                                    >
                                        <div className="font-medium">
                                            {n.sender.fullName}
                                        </div>
                                        {renderText(n)} <br />
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(n.createdAt), { locale: vi, addSuffix: true })}
                                        </span>
                                    </Link>
                                </div>
                            </div>
                            :
                            <div key={n._id} className={`flex w-full items-center hover:bg-base-200 rounded pl-3 pr-3 ${!n.isRead ? "bg-base-100" : ""}`}>
                                <img
                                    src={n.sender.profilePic || "/avatar.png"}
                                    alt={n.sender.fullName}
                                    className="size-12 object-cover rounded-full"
                                />
                                <div className={`p-2 flex flex-1   cursor-pointer `}>

                                    <Link
                                        // to={`/post/${n.sender.email}/${n.sender._id}/${n.post._id}`}
                                        state={{ background: location }}
                                        onClick={() => markNotificationAsRead(n._id)}
                                    >
                                        <div className="font-medium">
                                            {n.sender.fullName}
                                        </div>
                                        {renderText(n)} <br />
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(n.createdAt), { locale: vi, addSuffix: true })}
                                        </span>
                                    </Link>
                                </div>
                            </div>
                    })
                )}
            </div>
        </div>
    );
}
