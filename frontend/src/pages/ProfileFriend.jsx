import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, UserRoundPlus, ThumbsUp, MessageCircle, UserCheck, UserRoundX } from "lucide-react";
import Carousel from 'better-react-carousel'
import HeartPng from '../constants/tym.png'
import LikePng from '../constants/like.png'
import { Image } from 'antd'
import { useParams } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from '../lib/axios'
import DefaultUser from '../constants/default_user.jpg'


const ProfileFriend = () => {
    const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
    const [selectedImg, setSelectedImg] = useState(null);
    const [user, setUser] = useState(null);
    const [relationship, setRelationship] = useState(null);

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
                <div className="bg-base-200 max-w-6xl mx-auto p-4 py-8 mt-2 rounded-xl">
                    {/* post */}
                    <div className="post">
                        <div className="avatar flex items-center">
                            <div className="w-12 rounded-full mr-2">
                                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>
                            <div className="" >
                                <p className="text-sm font-bold">trung duc</p>
                                <p className="time text-sm">12:06</p>
                            </div>
                        </div>

                        {/* caption */}
                        <div className="caption text-sm">
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio architecto, laudantium officiis voluptatibus, reiciendis adipisci consequuntur ut aspernatur sunt hic distinctio tempora consequatur voluptate iste porro cumque modi. Neque, eum.
                        </div>
                        {/* image post */}
                        <div className="image_post mt-6 ">
                            <Carousel cols={2} rows={1} gap={12}>
                                <Carousel.Item>
                                    <Image src="https://picsum.photos/800/600?random=1" />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <Image src="https://picsum.photos/800/600?random=2" />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <Image src="https://picsum.photos/800/600?random=3" />
                                </Carousel.Item>
                            </Carousel>
                        </div>

                        {/* number like */}
                        <div className="number_like flex items-center mt-2 ">
                            <div className="stack stack-end mr-2">
                                <img src={HeartPng} alt="" className="w-6 h-6" />
                                <img src={LikePng} alt="" className="w-6 h-6" />
                            </div>
                            <p className="text-sm"> 22 đã thích</p>
                        </div>

                        {/* emotion */}
                        <div className="border-b-2 border-gray-600 mt-3 w-full"></div>
                        <div className="emotion flex items-center  ">
                            <div className="btn btn-soft flex-1">
                                <ThumbsUp className="w-4 h-4" />
                                <p className="text-sm">Thích</p>
                            </div>
                            <div className="btn btn-soft flex-1">
                                <MessageCircle className="w-4 h-4" />
                                <p className="text-sm">Bình luận</p>
                            </div>
                        </div>
                        <div className="border-b-2 border-gray-600 w-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );

};

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
