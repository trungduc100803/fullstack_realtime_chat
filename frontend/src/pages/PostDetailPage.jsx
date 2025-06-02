import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {axiosInstance} from '../lib/axios'
import { useEffect, useRef } from "react";
import {getTimeAgo} from '../lib/utils'
import Carousel from 'better-react-carousel'
import { Image } from 'antd'
import HeartPng from '../constants/tym.png'
import LikePng from '../constants/like.png'
import { Camera, Mail, User, ThumbsUp, MessageCircle, Trash2, SendHorizonal } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import DefaultUser from '../constants/default_user.jpg'

export default function PostDetailPage() {
    const {email, id, post, comment} = useParams()
    const [user, setUser] = useState(null)
    const [postt, setPostt] = useState(null)
    const [comments, setComments] = useState(null)
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
    const fileInputRef = useRef(null);
    const fileInputEditRef = useRef(null);
    const fileInputReplyRef = useRef(null);
    const [commentByPost, setCommentByPost] = useState('')
    const [imageByPost, setImageByPost] = useState(null)
    const [postComments, setPostComments] = useState([])
const [replyFormVisible, setReplyFormVisible] = useState(null);
  const [visibleImageBeforeEditComment, setVisibleImageBeforeEditComment] = useState(false)
  const [editContent, setEditContent] = useState('');
  const [editFormVisible, setEditFormVisible] = useState(null);
  const [editImage, setEditImage] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [deleteFormVisible, setDeleteFormVisible] = useState(null);

    const navigate = useNavigate();

    const getUser = async () => {
        const res = await axiosInstance.get(`/messages/getUser/${id}`)
        setUser(res.data.user)
    }
    const getPost  = async () => {
        const res = await axiosInstance.get(`/posts/get-post/${post}`)
        setPostt(res.data)
    }
    const getcomment = async () => {
        const res = await axiosInstance.get(`/comments/get-comment/${post}`)
        setComments(res.data)
    }

    useEffect(() => {
        getUser()
        getPost()
        getcomment()
    }, [])
    const fetchCommentsForAllPosts = async () => {

      const res = await axiosInstance.get(`/comments/get-comment/${postt._id}`);

    setPostComments(res.data);
  };

  useEffect(() => {

    postt && fetchCommentsForAllPosts();
  }, [postt]);

    const handleSubmit = async (e, postId) => {
        e.preventDefault()
        const content = commentByPost || '';
        const image = imageByPost || '';
    
        await axiosInstance.post(`/comments/create-comment/${postId}`, {
          content, image
        });
        fetchCommentsForAllPosts()
        // Clear sau khi submit
        setCommentByPost('');
        setImageByPost( null);
      }

        const handleCommentChange = (e) => {
    setCommentByPost(e.target.value);
  };
    const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageByPost(reader.result);
    };
    reader.readAsDataURL(file); // chuyển file ảnh thành base64
  };

    const statusLike = (likes) => {
    if (!likes.includes(authUser._id)) {
      return false
    } else {
      return true
    }
  }
    const handleLike = async (idPost) => {
    await axiosInstance.put(`/posts/${idPost}/like`)
    getPost()
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

     const handleImageChangeReply = (e) => {
    const file = e.target.files[0]

    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyImage(reader.result);
    };
    reader.readAsDataURL(file); // chuyển file ảnh thành base64
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

  const handleCloseModalDeleteComment = (e) => {
      e.preventDefault();
    navigate(-1)
    setDeleteFormVisible(null)
  }

  const deleteComment = async (e) => {
      e.preventDefault();
    await axiosInstance.delete(`/comments/delete-comment/${deleteFormVisible}`)
    handleCloseModalDeleteComment()
    fetchCommentsForAllPosts()
  }

   const handleOpenModalDeleteComment = (idComment) => {
    setDeleteFormVisible(idComment)
    document.getElementById('modalDeletecomment').showModal()
  }


    return (
        <div
            className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center"
            onClick={() => navigate(-1)}
        >
            <dialog id="modalDeletecomment" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button id="deletecomment" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Thông báo</h3>
          <div className="pt-6 pb-6">Bạn có chắc chắn muốn xóa bình luận?</div>
          <div className="flex items-center justify-end">
            <button onClick={e => handleCloseModalDeleteComment(e)} className="btn btn-success mr-3">Hủy bỏ</button>
            <button onClick={(e) => deleteComment(e)} className="btn btn-error">Xóa</button>
          </div>
        </div>
      </dialog>
            <div
                className="bg-[#1e1e1e] text-white w-[60vw] max-h-[90vh] rounded-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                    <img
                        src={postt && postt.userPost.profilePic}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold">{postt && postt.userPost.fullName}</p>
                        <p className="text-sm text-gray-400">{postt && getTimeAgo(postt.createdAt)}</p>
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
                    <CaptionToggle caption={postt && postt.caption} />
                    <div className="image_post mt-6 ">
                      <Carousel cols={1} rows={1} gap={20}>
                        {
                          postt && postt.images.map(i => {
                            return <Carousel.Item key={i} className="w-full max-h-[600px] object-contain mx-auto">
                              <Image src={i} />
                            </Carousel.Item>
                          })
                        }
                      </Carousel>
                    </div>
                </div>

                {/* Like + Comment section */}
                <div className=" p-4 number_like flex items-center mt-2 ">
                                      <div className="stack stack-end mr-2">
                                        <img src={HeartPng} alt="" className="w-6 h-6" />
                                        <img src={LikePng} alt="" className="w-6 h-6" />
                                      </div>
                                      <p className="text-sm">{postt && postt.likes.length} lượt thích</p>
                                    </div>
                <div className="p-4 border-t border-gray-700 space-y-2">
                        {
                            postt &&
                    <div className="emotion flex items-center  ">
                      <div onClick={() => handleLike(postt._id)} className="btn btn-soft flex-1">
                        {
                          statusLike(postt.likes) ? <img src={LikePng} alt="" className="w-6 h-6" /> :
                            <ThumbsUp className="w-4 h-4" />
                        }
                        <p className="text-sm">Thích</p>
                      </div>
                      <div onClick={() => document.getElementById('ipComment').focus()} className="btn btn-soft flex-1">
                        <MessageCircle className="w-4 h-4" />
                        <p className="text-sm">Bình luận</p>
                      </div>
                    </div>
                        }
                </div>

                {/* Input comment */}
                <div className="p-4 border-t border-gray-700">
                {
                    postt &&
                    <form onSubmit={(e) => handleSubmit(e, postt._id)}>
                                          <div className="flex items-center px-4 mt-3 gap-3 mb-3">
                                            <img src={authUser.profilePic !== '' ? authUser.profilePic : DefaultUser} className="w-9 h-9 rounded-full object-cover" />
                    
                                            <input
                                              type="text"
                                              value={commentByPost || ''}
                                              onChange={(e) => handleCommentChange(e)}
                                              placeholder="Viết bình luận..."
                                              className="bg-[#2d2f34] text-sm text-white placeholder-gray-400 px-4 py-2 rounded-full w-full focus:outline-none"
                                            />
                    
                                            <Camera onClick={() => fileInputRef.current.click()} className="w-6 h-6 cursor-pointer mr-4" />
                    
                                            <input
                                              id="ipComment"
                                              hidden
                                              type="file"
                                              accept="image/*"
                                              ref={fileInputRef}
                                              onChange={(e) => handleImageChange(e)}
                                            />
                    
                                            <button type="submit" className="text-blue-500 font-semibold text-sm">
                                              <SendHorizonal className="w-6 h-6 cursor-pointer" />
                                            </button>
                                          </div>
                    
                                          {imageByPost && (
                                            <div className="grid grid-cols-3 gap-2">
                                              <img src={imageByPost} className="w-full h-28 object-cover rounded" />
                                            </div>
                                          )}
                                        </form>
                }
                </div>
                <div className="p-4 border-t border-gray-700">

                {postComments?.length > 0 && (
                                      <div className="px-4 py-2 space-y-4">
                                        {postComments.map((comment) => {
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
                                                    <Camera onClick={() => fileInputReplyRef.current.click()} className="w-5 h-5 cursor-pointer" />
                                                    <input
                                                      type="file"
                                                      hidden
                                                      accept="image/*"
                                                      ref={fileInputReplyRef}
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
                                                    <Camera onClick={() => fileInputEditRef.current.click()} className="w-5 h-5 cursor-pointer" />
                                                    <input
                                                      type="file"
                                                      hidden
                                                      accept="image/*"
                                                      ref={fileInputEditRef}
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
        </div>
    );
}


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