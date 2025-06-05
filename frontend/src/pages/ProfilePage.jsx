import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, ThumbsUp, MessageCircle, Trash2, SendHorizonal } from "lucide-react";
import Carousel from 'better-react-carousel'
import { Image } from 'antd'
import HeartPng from '../constants/tym.png'
import LikePng from '../constants/like.png'
import PostForm from "../components/PostForm";
import { axiosInstance } from "../lib/axios";
import DefaultUser from '../constants/default_user.jpg'
import { getTimeAgo } from "../lib/utils";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [posts, setPosts] = useState([])
  const [postDeleteId, setPostDeleteId] = useState(null)
  const [postComments, setPostComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [imagesByPost, setImagesByPost] = useState({});
  const fileInputRefs = useRef(null);
  const editContentRef = useRef(null);
  const [visibleImageBeforeEditComment, setVisibleImageBeforeEditComment] = useState(false)
  const [replyFormVisible, setReplyFormVisible] = useState(null); // Lưu comment._id của comment đang mở form
  const [deleteFormVisible, setDeleteFormVisible] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editFormVisible, setEditFormVisible] = useState(null);
  const [editImage, setEditImage] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const fileInputRef = useRef(null);


  const handleCommentChange = (e, postId) => {
    setCommentsByPost(prev => ({
      ...prev,
      [postId]: e.target.value
    }));
  };

  const handleImageChange = (e, postId) => {
    const file = e.target.files[0]

    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagesByPost(prev => ({
        ...prev,
        [postId]: reader.result
      }));
    };
    reader.readAsDataURL(file); // chuyển file ảnh thành base64
  };

  const handleImageChangeReply = (e) => {
    const file = e.target.files[0]

    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyImage(reader.result);
    };
    reader.readAsDataURL(file); // chuyển file ảnh thành base64
  };

  const handleImageChangeEdit = (e) => {
    const file = e.target.files[0]
    setVisibleImageBeforeEditComment(true)
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImage(reader.result);
    };
    reader.readAsDataURL(file); // chuyển file ảnh thành base64
  };

  const fetchCommentsForAllPosts = async () => {
    const commentsMap = {};

    for (const post of posts) {
      const res = await axiosInstance.get(`/comments/get-comment/${post._id}`);
      commentsMap[post._id] = res.data;
    }

    setPostComments(commentsMap);
  };
  useEffect(() => {

    if (posts.length > 0) fetchCommentsForAllPosts();
  }, [posts]);


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const closeForm = () => {
    document.getElementById('closePostForm').click()
  }

  const getpost = async () => {
    const res = await axiosInstance.get(`/posts/get-post-by-id/${authUser._id}`)
    setPosts(res.data)
  }

  useEffect(() => {
    getpost()
  }, [])


  const handleLike = async (idPost) => {
    await axiosInstance.put(`/posts/${idPost}/like`)
    getpost()
  }

  const statusLike = (likes) => {
    if (!likes.includes(authUser._id)) {
      return false
    } else {
      return true
    }
  }

  const showModalDeletePost = (id) => {
    document.getElementById('modalDeletePost').showModal()
    setPostDeleteId(id)
  }

  const handleCloseModalDeletePost = () => {
    document.getElementById('deletePost').click()
    setPostDeleteId(null)
  }

  const deletePost = async () => {
    await axiosInstance.delete(`/posts/${postDeleteId}`)
    handleCloseModalDeletePost()
    getpost()
  }



  const handleSubmit = async (e, postId) => {
    e.preventDefault()
    const content = commentsByPost[postId] || '';
    const image = imagesByPost[postId] || '';

    await axiosInstance.post(`/comments/create-comment/${postId}`, {
      content, image
    });
    fetchCommentsForAllPosts()
    // Clear sau khi submit
    setCommentsByPost(prev => ({ ...prev, [postId]: '' }));
    setImagesByPost(prev => ({ ...prev, [postId]: null }));
  }

  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();

    try {
      await axiosInstance.post(`/comments/reply/${parentCommentId}`, {
        content: replyContent,
        image: replyImage
      });
      // Reset
      setReplyContent('');
      setReplyImage('');
      setReplyFormVisible(null);
      // Gọi hàm reload comment (tùy vào bạn có custom hook hoặc re-fetch lại)
      fetchCommentsForAllPosts()
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
    }
  };

  const handleEditCommentSubmit = async (e, CommentId) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/comments/edit-comment/${CommentId}`, {
        content: editContent,
        image: editImage
      });
      // Reset
      setEditContent('');
      setEditImage('');
      setEditFormVisible(null);
      setVisibleImageBeforeEditComment(false)
      // Gọi hàm reload comment (tùy vào bạn có custom hook hoặc re-fetch lại)
      fetchCommentsForAllPosts()
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
    }
  };

  const handleOpenModalDeleteComment = (idComment) => {
    setDeleteFormVisible(idComment)
    document.getElementById('modalDeletecomment').showModal()
  }

  const handleCloseModalDeleteComment = () => {
    document.getElementById('deletecomment').click()
    setDeleteFormVisible(null)
  }

  const deleteComment = async () => {
    await axiosInstance.delete(`/comments/delete-comment/${deleteFormVisible}`)
    handleCloseModalDeleteComment()
    fetchCommentsForAllPosts()
  }


  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Cá nhân</h1>
            <p className="mt-2">Thông tin cá nhân</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                    absolute bottom-0 right-0 
                    bg-base-content hover:scale-105
                    p-2 rounded-full cursor-pointer 
                    transition-all duration-200
                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                  `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Bấm vào biểu tượng camera để thay đổi hình nền"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Tên đầy đủ
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Địa chỉ email
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Trạng thái tài khoản</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Trạng thái</span>
                <span className="text-green-500">Kích hoạt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
            className="max-w-sm rounded-lg shadow-2xl "
          />
          <div className="mr-52">
            <h1 className="text-5xl font-bold">Bạn đang nghĩ gì?</h1>
            <p className="py-6">Bắt đầu tạo bài viết để chia sẻ những kỉ niệm, cảm xúc và giao lưu với bạn bè.
            </p>
            <button onClick={() => document.getElementById('modal_post').showModal()} className="btn btn-primary">Tạo bài viết</button>
          </div>
        </div>
      </div>

      {/* modal post */}
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="modal_post" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button id="closePostForm" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <PostForm currentUser={authUser} closeForm={closeForm} getpost={getpost} />
        </div>
      </dialog>
      {/*  */}

      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="modalDeletePost" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button id="deletePost" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Thông báo</h3>
          <div className="pt-6 pb-6">Bạn có chắc chắn muốn xóa bài viết?</div>
          <div className="flex items-center justify-end">
            <button onClick={handleCloseModalDeletePost} className="btn btn-success mr-3">Hủy bỏ</button>
            <button onClick={deletePost} className="btn btn-error">Xóa</button>
          </div>
        </div>
      </dialog>

      <dialog id="modalDeletecomment" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button id="deletecomment" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Thông báo</h3>
          <div className="pt-6 pb-6">Bạn có chắc chắn muốn xóa bình luận?</div>
          <div className="flex items-center justify-end">
            <button onClick={handleCloseModalDeleteComment} className="btn btn-success mr-3">Hủy bỏ</button>
            <button onClick={deleteComment} className="btn btn-error">Xóa</button>
          </div>
        </div>
      </dialog>

      <div className="">
        {
          posts.length > 0 ?
            posts.map(post => {
              return (
                <div key={post._id} className="bg-base-200 max-w-6xl mx-auto p-4 py-8 mt-2 rounded-xl">
                  {/* post */}
                  <div className="post">
                    <div className=" flex items-center justify-between">
                      <div className="flex  justify-center items-center overflow-hidden">
                        <div className="avatar">
                          <div className="w-12 mr-3 rounded-full">
                            <img src={post.userPost.profilePic !== '' ? post.userPost.profilePic : DefaultUser} />
                          </div>
                        </div>
                        <div className="" >
                          <p className=" text-sm font-bold">{post.userPost.fullName}</p>
                          <p className=" time text-sm">{getTimeAgo(post.createdAt)}</p>
                        </div>
                      </div>
                      <p onClick={() => showModalDeletePost(post._id)} className="justify-end cursor-pointer">
                        <Trash2 className="w-6 h-6" />
                      </p>
                    </div>

                    {/* caption */}
                    <CaptionToggle caption={post.caption} />
                    {/* image post */}
                    <div className="image_post mt-6 ">
                      <Carousel cols={1} rows={1} gap={20}>
                        {
                          post.images.map(i => {
                            return <Carousel.Item key={i} className="w-full max-h-[600px] object-contain mx-auto">
                              <Image src={i} />
                            </Carousel.Item>
                          })
                        }
                      </Carousel>
                    </div>

                    {/* number like */}
                    <div className="number_like flex items-center mt-2 ">
                      <div className="stack stack-end mr-2">
                        <img src={HeartPng} alt="" className="w-6 h-6" />
                        <img src={LikePng} alt="" className="w-6 h-6" />
                      </div>
                      <p className="text-sm">{post.likes.length} lượt thích</p>
                    </div>

                    {/* emotion */}
                    <div className="border-b-2 border-gray-600 mt-3 w-full"></div>
                    <div className="emotion flex items-center  ">
                      <div onClick={() => handleLike(post._id)} className="btn btn-soft flex-1">
                        {
                          statusLike(post.likes) ? <img src={LikePng} alt="" className="w-6 h-6" /> :
                            <ThumbsUp className="w-4 h-4" />
                        }
                        <p className="text-sm">Thích</p>
                      </div>
                      <div onClick={() => document.getElementById('ipComment').focus()} className="btn btn-soft flex-1">
                        <MessageCircle className="w-4 h-4" />
                        <p className="text-sm">Bình luận</p>
                      </div>
                    </div>
                    <div className="border-b-2 border-gray-600 w-full"></div>
                    {/*  */}
                    <form onSubmit={(e) => handleSubmit(e, post._id)}>
                      <div className="flex items-center px-4 mt-3 gap-3 mb-3">
                        <img src={authUser.profilePic !== '' ? authUser.profilePic : DefaultUser} className="w-9 h-9 rounded-full object-cover" />

                        <input
                          type="text"
                          value={commentsByPost[post._id] || ''}
                          onChange={(e) => handleCommentChange(e, post._id)}
                          placeholder="Viết bình luận..."
                          className="bg-[#2d2f34] text-sm text-white placeholder-gray-400 px-4 py-2 rounded-full w-full focus:outline-none"
                        />

                        <Camera onClick={() => fileInputRefs[post._id]?.click()} className="w-6 h-6 cursor-pointer mr-4" />

                        <input
                          id="ipComment"
                          hidden
                          type="file"
                          accept="image/*"
                          ref={(el) => (fileInputRefs[post._id] = el)}
                          onChange={(e) => handleImageChange(e, post._id)}
                        />

                        <button type="submit" className="text-blue-500 font-semibold text-sm">
                          <SendHorizonal className="w-6 h-6 cursor-pointer" />
                        </button>
                      </div>

                      {imagesByPost[post._id] && (
                        <div className="grid grid-cols-3 gap-2">
                          <img src={imagesByPost[post._id]} className="w-full h-28 object-cover rounded" />
                        </div>
                      )}
                    </form>

                    {/*  */}
                    {postComments[post._id]?.length > 0 && (
                      <div className="px-4 py-2 space-y-4">
                        {postComments[post._id].map((comment) => {
                          return (<div key={comment._id} className="flex items-start gap-3" >
                            <img
                              src={comment.userComment.profilePic !== '' ? comment.userComment.profilePic : DefaultUser}
                              alt="avatar"
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            <div className="bg-[#2d2f34] rounded-lg px-4 py-2 w-full">
                              <div className="text-sm font-medium text-white">
                                {comment.userComment.fullName}
                              </div>
                              <div className="text-sm text-gray-300 whitespace-pre-line ">
                                {comment.content}
                              </div>
                              {comment.image && (
                                <img
                                  src={comment.image}
                                  alt="comment-img"
                                  className="mt-2 max-w-xs rounded"
                                />
                              )}
                              {
                                authUser._id === comment.userComment._id ? (
                                  <div className="flex">
                                    <div onClick={() => setReplyFormVisible(comment._id)} className="text-xs mr-3 text-blue-400 cursor-pointer mt-1 hover:underline">
                                      Trả lời</div>

                                    <div onClick={() => setEditFormVisible(comment._id)} className="text-xs mr-3 text-gray-400 cursor-pointer mt-1 hover:underline">
                                      Sửa                               </div>
                                    <div onClick={() => handleOpenModalDeleteComment(comment._id)} className="text-xs text-red-400 cursor-pointer mt-1 hover:underline">
                                      Xóa                                </div>
                                    <p className="text-xs ml-3 mt-1">{getTimeAgo(comment.createdAt)}</p>
                                  </div>
                                ) :
                                  <div className="flex">

                                    <div onClick={() => setReplyFormVisible(comment._id)} className="text-xs mr-3 text-blue-400 cursor-pointer mt-1 hover:underline">
                                      Trả lời</div>
                                    <p className="text-xs ml-3 mt-1">{getTimeAgo(comment.createdAt)}</p>
                                  </div>
                              }

                              {/* reply form */}
                              {replyFormVisible === comment._id && (
                                <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className=" mt-2 ml-10">
                                  <div className="flex items-center gap-3">
                                    <div onClick={() => setReplyFormVisible(null)} className="text-xs text-blue-400 cursor-pointer mt-1 hover:underline">
                                      Đóng</div>
                                    <img
                                      src={authUser.profilePic}
                                      alt="your-avatar"
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Viết phản hồi..."
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      className="bg-[#2d2f34] text-sm text-white px-3 py-1 rounded-full w-full focus:outline-none"
                                    />
                                    <Camera onClick={() => fileInputRef.current.click()} className="w-5 h-5 cursor-pointer" />
                                    <input
                                      type="file"
                                      hidden
                                      accept="image/*"
                                      ref={fileInputRef}
                                      onChange={(e) => handleImageChangeReply(e)}
                                    />
                                    <button type="submit" className="text-blue-500 font-semibold text-sm">
                                      <SendHorizonal className="w-5 h-5" />
                                    </button>
                                  </div>
                                  {replyImage && (
                                    <div className="mt-2">
                                      <img src={replyImage} className="w-24 h-24 object-cover rounded" />
                                    </div>
                                  )}
                                </form>
                              )}
                              {/* edit form */}
                              {editFormVisible === comment._id && (
                                <form onSubmit={(e) => handleEditCommentSubmit(e, comment._id)} className=" mt-2 ml-10">
                                  <div className="flex items-center gap-3">
                                    <div onClick={() => setEditFormVisible(null)} className="text-xs text-gray-400 cursor-pointer mt-1 hover:underline">
                                      Đóng</div>
                                    <img
                                      src={authUser.profilePic !== '' ? authUser.profilePic : DefaultUser}
                                      alt="your-avatar"
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Viết phản hồi..."
                                      value={editContent !== '' ? editContent : comment.content}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      className="bg-[#2d2f34] text-sm text-white px-3 py-1 rounded-full w-full focus:outline-none"
                                    />
                                    <Camera onClick={() => editContentRef.current.click()} className="w-5 h-5 cursor-pointer" />
                                    <input
                                      type="file"
                                      hidden
                                      accept="image/*"
                                      ref={editContentRef}
                                      onChange={(e) => handleImageChangeEdit(e)}
                                    />
                                    <button type="submit" className="text-blue-500 font-semibold text-sm">
                                      Sửa
                                    </button>
                                  </div>
                                  {
                                    comment.image !== "" ? <div className={!visibleImageBeforeEditComment ? 'mt-2 ' : 'mt-2 hidden'}>
                                      <img src={comment.image} className="w-24 h-24 object-cover rounded" />
                                    </div> : <></>
                                  }
                                  {editImage && (
                                    <div className="mt-2">
                                      <img src={editImage} className="w-24 h-24 object-cover rounded" />
                                    </div>
                                  )}
                                </form>
                              )}
                              {/* Replies */}
                              {comment.replies?.length > 0 && (
                                <div className="mt-2 ml-6 space-y-2">
                                  {comment.replies.map((reply) => (
                                    <div key={reply._id} className="flex items-start gap-2">
                                      <img
                                        src={reply.userComment.profilePic}
                                        alt="avatar"
                                        className="w-7 h-7 rounded-full object-cover"
                                      />
                                      <div className="bg-[#3a3c42] rounded-lg px-3 py-1">
                                        <div className="text-xs font-medium text-white">
                                          {reply.userComment.fullName}
                                        </div>
                                        <div className="text-sm text-gray-300 whitespace-pre-line">
                                          {reply.content}
                                        </div>
                                        <p className="text-xs  mt-1">{getTimeAgo(reply.createdAt)}</p>

                                        {reply.image && (
                                          <img
                                            src={reply.image}
                                            alt="reply-img"
                                            className="mt-1 max-w-xs rounded"
                                          />
                                        )}

                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>)
                        })}
                      </div>
                    )}

                  </div>
                </div>
              )
            })
            :
            <></>
        }

      </div>
    </div >
  );

};

function CaptionToggle({ caption }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const captionRef = useRef(null);

  useEffect(() => {
    const el = captionRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [caption]);

  return (
    <div>
      <p
        ref={captionRef}
        className={`text-base mt-4 whitespace-pre-line ${!expanded ? "line-clamp-3" : ""}`}
      >
        {caption}
      </p>
      {isClamped && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-500 hover:underline mt-1"
        >
          {expanded ? "Ẩn bớt" : "Xem thêm"}
        </button>
      )}
    </div>);
}
export default ProfilePage;
