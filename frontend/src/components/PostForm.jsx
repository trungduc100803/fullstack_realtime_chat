import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";


function PostForm({ currentUser, closeForm, getpost }) {
    const [caption, setCaption] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!caption && images.length === 0) {
            return alert("Vui lòng nhập nội dung hoặc chọn ảnh!");
        }

        const formData = new FormData();
        formData.append("userPost", currentUser._id);
        formData.append("caption", caption);

        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]); // tên "images" phải khớp với backend
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post("/posts/create-post", formData);
            console.log(res.data)
            setCaption("");
            setImages([]);
            closeForm()
            getpost()
            toast.success("Đã tạo bài viết thành công")
        } catch (err) {
            console.error("Lỗi đăng bài:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto my-4 bg-base-100 shadow-lg rounded-xl p-4">
            <h2 className="text-xl font-bold mb-4">📢 Đăng bài viết</h2>
            <form onSubmit={handlePost} className="space-y-3">
                <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Bạn đang nghĩ gì?"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                />

                <input
                    type="file"
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(Array.from(e.target.files))}
                />

                {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(img)}
                                alt={`Ảnh ${index}`}
                                className="w-full h-28 object-cover rounded"
                            />
                        ))}
                    </div>
                )}

                <button
                    type="submit"
                    className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                    disabled={loading}
                >
                    {loading ? "Đang đăng..." : "Đăng bài"}
                </button>
            </form>
        </div>
    );
}

export default PostForm;
