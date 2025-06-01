import React, { useEffect, useState } from 'react'
import { axiosInstance } from '../lib/axios'
import UserDefault from '../constants/default_user.jpg'
import EmptyNoti from '../constants/empty_noti.webp'


const RequestFriendPage = () => {

    const [notify, setNotify] = useState([])

    const getNotify = async () => {
        const res = await axiosInstance.get('/messages/getNotiAddFriend')
        setNotify(res.data.notiAddFriend)
    }

    const acceptFriend = async (id) => {
        await axiosInstance.post('/messages/acceptAddfriend', {
            userIdAddFriend: id
        })
        getNotify()
    }
    useEffect(() => {
        getNotify()
    }, [])
    return (
        <div className='h-screen pt-20'>
            <p className="text-2xl mx-auto max-w-6xl font-bold mb-8">Lời mời kết bạn</p>
            <div className="profile bg-base-300 max-w-6xl mx-auto p-4 py-8 mt-2 rounded-xl h-3/4 overflow-auto">
                <div className="notify">
                    {
                        notify.length > 0 ?
                            notify.map(n => {
                                return <div key={n._id} className="notify_item mb-2 h-auto p-2 bg-base-200 rounded-xl w-full flex items-center justify-start">
                                    <div className="avatar w-9">
                                        <div className="w-10 rounded-full">
                                            <img src={n.profilePic == '' ? UserDefault : n.profilePic} />
                                        </div>
                                    </div>
                                    <div className='flex-col items-start justify-start'>
                                        <p className=" flex-1 text-sm text-start ml-4 ">{`${n.fullName} đã gửi cho bạn lời mời kết bạn`}</p>
                                        <div className='flex items-center ml-4 mt-3 justify-start'>
                                            <button onClick={() => acceptFriend(n._id)} className='text-start btn btn-soft mr-4 '>Chấp nhận</button>
                                            <button className='text-start btn btn-soft'>Từ chối</button>
                                        </div>
                                    </div>
                                </div>
                            }) :
                            <div className='flex'>
                                <div className='m-auto flex-col justify-center items-center '>
                                    <img className='w-40 ' src={EmptyNoti} alt="" />
                                    <p className="text-sm">Bạn không có lời mời kết bạn nào</p>
                                </div>

                            </div>
                    }
                </div>

            </div>
        </div >
    )
}

export default RequestFriendPage