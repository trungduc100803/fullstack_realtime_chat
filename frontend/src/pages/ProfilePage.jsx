import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, ThumbsUp, MessageCircle } from "lucide-react";
import Carousel from 'better-react-carousel'
import HeartPng from '../constants/tym.png'
import LikePng from '../constants/like.png'
import { Image } from 'antd'

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

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
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
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
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
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
            <button className="btn btn-primary">Tạo bài viết</button>
          </div>
        </div>
      </div>


      <div className="">
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
export default ProfilePage;
