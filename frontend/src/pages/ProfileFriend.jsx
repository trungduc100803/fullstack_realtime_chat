import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, UserRoundPlus, ThumbsUp, MessageCircle, UserCheck, UserRoundX, SendHorizonal, Camera } from "lucide-react";
import Carousel from 'better-react-carousel'
import HeartPng from '../constants/tym.png'
import LikePng from '../constants/like.png'
import { Image } from 'antd'
import { useParams } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from '../lib/axios'
import DefaultUser from '../constants/default_user.jpg'
import { formatMessageTime } from "../lib/utils";



const ProfileFriend = () => {
    const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const [user, setUser] = useState(null);
    const [relationship, setRelationship] = useState(null);
    const [posts, setPosts] = useState([])
    const [postComments, setPostComments] = useState({});
    const [commentsByPost, setCommentsByPost] = useState({});
    const [imagesByPost, setImagesByPost] = useState({});
    const fileInputRefs = useRef(null);


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

    const handleCommentChange = (e, postId) => {
        setCommentsByPost(prev => ({
            ...prev,
            [postId]: e.target.value
        }));
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

    const { email, id } = useParams()
    const getUser = async () => {
        const res = await axiosInstance.post('/messages/searchUser', { userEmailSearch: email })
        setUser(res.data.userSearch)
    }
    const statusRelationship = async () => {
        const res = await axiosInstance.post('/messages/checkfriend', { emailCheck: email })

        if (res.data.status === 0) {
            setRelationship('Người lạ')
        } else if (res.data.status === 1) {
            setRelationship('Bạn bè')
        } else {
            setRelationship('Đã gửi lời mời kết bạn')
        }
    }
    useEffect(() => {
        getUser()
        statusRelationship()
    }, [email])


    const getpost = async () => {
        const res = await axiosInstance.get(`/posts/get-post-by-id/${id}`)
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

    const handleSubmit = () => {

    }

    return (
        <div className="h-screen pt-20">
            <div className="profile bg-base-300 max-w-6xl mx-auto p-4 py-8 mt-2 rounded-xl">
                <div className="avatar flex items-center ">
                    <div className="ring-primary ring-offset-base-100 w-32 rounded-full ring-2 ring-offset-2">
                        <img src={user && user.profilePic === '' ? DefaultUser : user && user.profilePic} />
                    </div>
                    <div className="info ml-8 max-h-36 w-80 max-w-96">
                        <div className="info_item mb-2 flex items-center">
                            <span className="text-sm text-gray-400 font-bold">Họ tên: </span>
                            <p className="text-sm ml-2">{user && user.fullName}</p>
                        </div>
                        <div className="info_item mb-2 flex items-center">
                            <span className="text-sm text-gray-400 font-bold">Email: </span>
                            <p className="text-sm ml-2">{user && user.email}</p>
                        </div>
                        <div className="info_item mb-2 flex items-center">
                            <span className="text-sm text-gray-400 font-bold">Mối quan hệ: </span>
                            <p className="text-sm ml-2">{relationship}</p>
                        </div>
                        <div className="btn_user mt-6 flex items-center">
                            <RelationshipStatus relationship={relationship} userIdAddFriend={id} getUser={getUser} getRelationship={statusRelationship} />

                            <button className="btn btn-sm gap-2 border-solid border-gray-400" >
                                <MessageSquare className="size-5" />
                                <span className="hidden sm:inline">Nhắn tin</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <div className="max-w-6xl mx-auto p-4 py-8 mt-2 rounded-xl">
                    {/* post */}
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
                                                            <img src={post.userPost.profilePic} />
                                                        </div>
                                                    </div>
                                                    <div className="" >
                                                        <p className=" text-sm font-bold">{post.userPost.fullName}</p>
                                                        <p className=" time text-sm">{formatMessageTime(post.createdAt)}</p>
                                                    </div>
                                                </div>

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
                                                <div className="btn btn-soft flex-1">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <p className="text-sm">Bình luận</p>
                                                </div>
                                            </div>
                                            <div className="border-b-2 border-gray-600 w-full"></div>

                                            {/*  */}
                                            <form onSubmit={(e) => handleSubmit(e, post._id)}>
                                                <div className="flex items-center px-4 mt-3 gap-3 mb-3">
                                                    <img src={authUser.profilePic} className="w-9 h-9 rounded-full object-cover" />

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
                                                                src={comment.userComment.profilePic}
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
                                                                        </div>
                                                                    ) :
                                                                        <div className="flex">
                                                                            <div onClick={() => setReplyFormVisible(comment._id)} className="text-xs mr-3 text-blue-400 cursor-pointer mt-1 hover:underline">
                                                                                Trả lời</div>
                                                                        </div>
                                                                }

                                                                {/* reply form */}
                                                                {/* {replyFormVisible === comment._id && (
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
                                                                )} */}
                                                                {/* edit form */}
                                                                {/* {editFormVisible === comment._id && (
                                                                    <form onSubmit={(e) => handleEditCommentSubmit(e, comment._id)} className=" mt-2 ml-10">
                                                                        <div className="flex items-center gap-3">
                                                                            <div onClick={() => setEditFormVisible(null)} className="text-xs text-gray-400 cursor-pointer mt-1 hover:underline">
                                                                                Đóng</div>
                                                                            <img
                                                                                src={authUser.profilePic}
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
                                                                )} */}
                                                                {/* Replies */}
                                                                {/* {comment.replies?.length > 0 && (
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
                                                                )} */}
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
            </div>
        </div>
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
                className={`text-base whitespace-pre-line ${!expanded ? "line-clamp-3" : ""}`}
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

const RelationshipStatus = ({ relationship, userIdAddFriend, getUser, getRelationship }) => {

    const addFriend = async () => {
        await axiosInstance.post('/messages/addfriend', { userIdAddFriend })
        getUser()
        getRelationship()
    }

    const cancelAddFriend = async () => {
        await axiosInstance.post('/messages/cancelAddfriend', { userIdCancelAddFriend: userIdAddFriend })
        getUser()
        getRelationship()
    }
    switch (relationship) {
        case 'Người lạ':
            return <button onClick={addFriend} className="btn btn-sm gap-2 mr-4 border-solid border-gray-400" >
                <UserRoundPlus className="size-5" />
                <span className="hidden sm:inline">Kết bạn</span>
            </button>
        case 'Bạn bè':
            return <button className="btn btn-sm gap-2 mr-4 border-solid border-gray-400" >
                <UserCheck className="size-5" />
                <span className="hidden sm:inline">Bạn bè</span>
            </button>
        case 'Đã gửi lời mời kết bạn':
            return <button onClick={cancelAddFriend} className="btn btn-sm gap-2 mr-4 border-solid border-gray-400" >
                <UserRoundX className="size-5" />
                <span className="hidden sm:inline">Hủy yêu cầu</span>
            </button>
        default:
            return <button onClick={addFriend} className="btn btn-sm gap-2 mr-4 border-solid border-gray-400" >
                <UserRoundPlus className="size-5" />
                <span className="hidden sm:inline">Kết bạn</span>
            </button>
    }

};
export default ProfileFriend;
