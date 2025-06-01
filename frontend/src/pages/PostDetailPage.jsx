import { useNavigate, useParams } from "react-router-dom";

export default function PostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Dữ liệu giả — thay bằng API nếu có
    const post = {
        id,
        user: { name: "trung duc", avatar: "/avatar.jpg" },
        time: "6 ngày trước",
        content: "CUC CHÍNH TRỊ QUÂN ĐOÀN 34 CÓ THÔNG BÁO...",
        image: "/soldier.jpg",
        comments: [
            { id: 1, name: "trung duc", text: "tha cho người ta đi", reply: "huuhh" },
        ],
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center"
            onClick={() => navigate(-1)}
        >
            <div
                className="bg-[#1e1e1e] text-white w-[600px] max-h-[90vh] rounded-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                    <img
                        src={post.user.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold">{post.user.name}</p>
                        <p className="text-sm text-gray-400">{post.time}</p>
                    </div>
                    <button
                        className="ml-auto text-gray-400 hover:text-white"
                        onClick={() => navigate(-1)}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <p>{post.content}</p>
                    <img src={post.image} alt="post" className="rounded-lg" />
                </div>

                {/* Like + Comment section */}
                <div className="p-4 border-t border-gray-700 space-y-2">
                    <p className="text-sm text-gray-400">1 lượt thích</p>
                    <div className="flex gap-4 text-gray-400 text-sm">
                        <button>👍 Thích</button>
                        <button>💬 Bình luận</button>
                    </div>
                    <div>
                        {post.comments.map((c) => (
                            <div key={c.id} className="mt-2">
                                <p className="text-sm font-semibold">{c.name}</p>
                                <p className="text-sm">{c.text}</p>
                                {c.reply && (
                                    <div className="ml-4 text-sm text-gray-400">{c.reply}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input comment */}
                <div className="p-4 border-t border-gray-700">
                    <input
                        type="text"
                        placeholder="Viết bình luận..."
                        className="w-full p-2 rounded bg-[#2a2a2a] text-white outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
