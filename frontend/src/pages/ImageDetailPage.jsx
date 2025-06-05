import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Carousel from 'better-react-carousel'
import { Image } from 'antd'


const ImageDetailPage = () => {
  const { id } = useParams()
  const [imageIngroup, setImageIngroup] = useState([])

  const getAllImageInGroup = async () => {
    const res = await axiosInstance.get(`/groups/get-image-in-group/${id}`)
    setImageIngroup(res.data.imageInGroup)
  }

  useEffect(() => {
    getAllImageInGroup()
  }, [])
  return (
    <div className="h-screen w-[70%] container mx-auto px-4 pt-20 max-w-5xl">
      <p className="text-2xl font-bold mb-6">Tất cả ảnh đã gửi</p>

      <Carousel cols={4} rows={1} gap={20} >
        {
          imageIngroup.length > 0 && imageIngroup.map(i => {
            return <Carousel.Item key={i} className="w-full  max-h-[600px] object-contain mx-auto">
              <Image src={i.image} />
            </Carousel.Item>
          })
        }
      </Carousel>
    </div>
  );
};
export default ImageDetailPage;
