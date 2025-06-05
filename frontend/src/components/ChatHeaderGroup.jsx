import { X, UserRoundPlus, EllipsisVertical, UserMinus, Key, Loader, CircleX, Users, Pencil } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useState, useEffect } from "react";
import DefaultUser from '../constants/default_user.jpg'
import toast from "react-hot-toast";
import Carousel from 'better-react-carousel'
import { Image } from 'antd'

const ChatHeaderGroup = () => {
  const { selectedGroup, setSelectedGroup } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [searchMemberValue, setSearchMemberValue] = useState('')
  const [loading, setLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState('');
  const [members, setMembers] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedMember, setSelectedMember] = useState({});
  const [checkedList, setCheckedList] = useState([]);
  const [listMemberSelected, setListMemberSelected] = useState([]);
  const [loadingCreateGroup, setLoadingCreateGroup] = useState(false);
  const [userForGroup, setUserForGroup] = useState([])
  const [imageIngroup, setImageIngroup] = useState([])
  const [nameGroup, setNameGroup] = useState()
  const [visibleEditNameGroup, setVisibleEditNameGroup] = useState(false)
  const [visibleEditImageGroup, setVisibleEditImageGroup] = useState(false)
  const [group, setGroup] = useState(null)
  const [imageGroup, setImageGroup] = useState('')

  const getUserForGroup = async () => {
    const res = await axiosInstance.get(`/groups/get-members-group/${selectedGroup._id}`)
    setUserForGroup(res.data.members)
  }

  const getAllImageInGroup = async () => {
    const res = await axiosInstance.get(`/groups/get-image-in-group/${selectedGroup._id}`)
    setImageIngroup(res.data.imageInGroup)
  }

  const getGroupForId = async () => {
    const res = await axiosInstance.get(`/groups/get-group-for-id/${selectedGroup._id}`)
    setGroup(res.data.group)
    setNameGroup(res.data.group.name)
    setImageGroup(res.data.group.image)
  }


  useEffect(() => {
    getUserForGroup()
    getAllImageInGroup()
    getGroupForId()
  }, [])

  const handleDeleteMemberChecked = async id => {
    const updatedList = checkedList.filter(name => name !== id);

    setCheckedList(updatedList)
    const arr = await Promise.all(
      updatedList.map(async u => {
        const res = await axiosInstance.get(`/messages/getUser/${u}`)
        return res.data.user;
      })
    );
    setListMemberSelected(arr)
    setDebouncedValue('')
  }

  const handleCheckMember = e => {
    const { name, checked } = e.target;
    setCheckedItems(prev => ({
      ...prev,
      [name]: checked,
    }));
  }

  const handleSelectMember = e => {
    const { name, checked } = e.target;
    setSelectedMember(prev => ({
      ...prev,
      [name]: checked,
    }));
  }

  useEffect(() => {
    const c = Object.keys(checkedItems).filter(name => checkedItems[name]);
    setCheckedList(c)
  }, [checkedItems])

  const getMember = async () => {
    const arr = await Promise.all(
      checkedList.map(async u => {
        const res = await axiosInstance.get(`/messages/getUser/${u}`)
        return res.data.user;
      })
    );
    setListMemberSelected(arr)
  }

  useEffect(() => {
    if (checkedList.length == 0) {
      return
    }
    getMember()
  }, [checkedList])


  // Gọi API khi debouncedValue thay đổi
  useEffect(() => {
    const getMembers = async () => {
      const res = await axiosInstance.get(`/messages/user-for-name/${debouncedValue}`)
      const filtered = res.data.arr.filter(item => item !== null);
      setMembers(filtered)
    }
    if (debouncedValue) {
      setLoading(true)
      getMembers()
    }
  }, [debouncedValue]);


  // Cập nhật debouncedValue sau 1s không gõ nữa
  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(false)
      setDebouncedValue(searchMemberValue);
    }, 1000);

    return () => {
      clearTimeout(handler); // Clear timeout nếu người dùng tiếp tục gõ
    };
  }, [searchMemberValue]);


  const handleDeleteMemberInGroup = async () => {
    const memberDeleteId = selectedGroup.members.filter(key => selectedMember[key] === true);
    const res = await axiosInstance.post(`/groups/delete-member-group/${selectedGroup._id}`, {
      membersId: memberDeleteId
    })
    if (res.status) {
      toast.success('Đã xóa thành viên ra khỏi nhóm')
      document.getElementById('close_delete_memeber').click()
      getUserForGroup()
      setSelectedMember([])
    } else {
      toast.error('Xóa không thành công')
      setSelectedMember([])
    }
  }

  const handleAddMemberToGroup = async () => {
    const res = await axiosInstance.post(`groups/add-member-group/${selectedGroup._id}`, { membersId: checkedList })
    if (res.data.status) {
      toast('Thêm thành viên vào nhóm thành công')
      document.getElementById('close_add_member_to_group').click()
    } else {
      toast(res.data.message)
    }
  }

  const handleDeleteGroup = async () => {
    const res = await axiosInstance.delete(`/groups/delete-group/${selectedGroup._id}`)
    if (res.data.status) {
      toast.success('Xóa nhóm thành công')
      document.getElementById('close_delete_group').click()
      setSelectedGroup(null)
    } else {
      toast.error(res.data.message)
    }
  }

  const handleEditNameGroup = () => {
    document.getElementById('ipNameGroup').focus()
    setVisibleEditNameGroup(true)
  }

  const handleSaveNameGroup = async () => {
    setVisibleEditNameGroup(false)
    if (nameGroup.trim() === '') {
      toast.error('Tên đang bị bỏ trống')
      setNameGroup(group.name)
      return
    } else {
      const res = await axiosInstance.put(`/groups/change-name-group/${selectedGroup._id}`, { newName: nameGroup })
      if (res.data.status) {
        toast.success('Đã đổi tên thành công')
        getGroupForId()
      } else {
        toast.error(res.data.message)
        setNameGroup(group.name)
      }
    }
  }

  const handleChangeImageGroup = () => {
    document.getElementById('ipImageGroup').click()
    setVisibleEditImageGroup(true)
  }

  const changeImageGroup = e => {
    const file = e.target.files[0]

    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageGroup(reader.result); // base64 string sẽ nằm trong result
    };
    reader.readAsDataURL(file); // chuyển file ảnh thành base64
  }

  const handleSaveImageGroup = async () => {
    setVisibleEditImageGroup(false)
    const res = await axiosInstance.put(`/groups/change-image-group/${selectedGroup._id}`, { newImage: imageGroup })
    if (res.data.status) {
      toast.success('Đã đổi tên thành công')
      getGroupForId()
    } else {
      toast.error(res.data.message)
      setImageGroup(group.image)
    }
  }

  const cancelChangeImageGroup = () => {
    setVisibleEditImageGroup(false)
    setImageGroup(group.image)
  }

  console.log(group)

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">

          {/* delete member */}
          {/* You can open the modal using document.getElementById('ID').showModal() method */}
          <dialog id="modal_delete_member" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button id="close_delete_memeber" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg">Chọn thành viên để xóa</h3>
              <div className=" border-t border-gray-700 mt-2"></div>
              <div className="more_members mt-8"></div>
              {
                userForGroup.length > 0 && userForGroup.map((user) => {
                  return (
                    <div key={user._id} className="more_members_item flex p-3 rounded items-center justify-between hover:bg-base-200">
                      <div className="flex  items-center">
                        <div className="avatar mr-3 ">
                          <div className="w-12 rounded-full">
                            <img src={user.profilePic === '' ? DefaultUser : user.profilePic} />
                          </div>
                        </div>
                        <p className="text-xl">{user.fullName}</p>
                      </div>
                      <input
                        name={user._id}
                        onChange={e => handleSelectMember(e)}
                        type="checkbox"
                        className="checkbox "
                      />
                    </div>
                  )
                })
              }
              <button onClick={handleDeleteMemberInGroup} type="submit" className="btn btn-outline btn-secondary mt-10 w-full" >Xóa thành viên khỏi nhóm</button>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          {/* more */}
          {/* You can open the modal using document.getElementById('ID').showModal() method */}
          <dialog id="modal_more_members" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-2xl ">Tất cả thành viên</h3>
              <div className=" border-t border-gray-700 mt-2"></div>

              <div className="more_members mt-8">
                {
                  userForGroup.length > 0 && userForGroup.map((user) => {
                    return (
                      <Link to={user._id === authUser._id ? `/profile` : `/profile/${user.email}/${user._id}`} key={user._id} className="more_members_item flex p-3 rounded items-center hover:bg-base-200">
                        <div className="avatar mr-3">
                          <div className="w-12 rounded-full">
                            <img src={user.profilePic === '' ? DefaultUser : user.profilePic} />
                          </div>
                        </div>
                        <p className="text-xl">{user.fullName}</p>
                      </Link>
                    )
                  })
                }

              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
          {/* Open the modal using document.getElementById('ID').showModal() method */}
          <dialog id="modal_more" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button id='close_delete_group' className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-2xl mb-4 ">Thông tin</h3>
              <div className="modal_more_container">
                <div className="info_group flex flex-col items-center mb-2">
                  <div className="avatar relative">
                    <div className="w-16 rounded-full relative">
                      <img src={imageGroup} />
                      <Pencil onClick={handleChangeImageGroup} className=" w-5 h-5 ml-3 cursor-pointer absolute bottom-3  right-0 " />
                      <input onChange={e => changeImageGroup(e)} type="file" name="" hidden id="ipImageGroup" />
                    </div>
                  </div>
                  {
                    visibleEditImageGroup ? <div className="flex items-center mt-2">
                      <button className="btn mr-3" onClick={handleSaveImageGroup}>Lưu</button>
                      <button className="btn btn-outline btn-secondary" onClick={cancelChangeImageGroup}>Hủy</button>
                    </div> : <></>
                  }
                  <div className="flex items-center">
                    <input onChange={e => setNameGroup(e.target.value)} id='ipNameGroup' className="text-center bg-transparent outline-none" type="text" name="" value={nameGroup} />
                    {
                      visibleEditNameGroup ? <>
                        <button className="btn mr-3" onClick={handleSaveNameGroup}>Lưu</button>
                        <button className="btn btn-outline btn-secondary" onClick={() => setVisibleEditNameGroup(false)}>Hủy</button>
                      </> : <></>
                    }
                    <Pencil className="w-4 h-4 ml-3 cursor-pointer" onClick={handleEditNameGroup} />
                  </div>
                </div>
                <div className=" border-t border-gray-700"></div>

                <div onClick={() => document.getElementById('modal_more_members').showModal()} className="members flex cursor-pointer pt-4 pb-4 hover:bg-base-200">
                  <Users className="w-6 h-6 mr-3" />
                  <p className="text-xl">{userForGroup.length} thành viên</p>
                </div>
                <Link className="members flex cursor-pointer pt-4 pb-4 hover:bg-base-200">
                  <Key className="w-6 h-6 mr-3" />
                  <p className="text-xl">Quản trị viên</p>
                </Link>
                <div className=" border-t border-gray-700"></div>

                <div className="imageandvideo pt-4 pb-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xl">Ảnh và video</p>
                    <Link to={`/image/${selectedGroup._id}`} className="imageandvideo_more cursor-pointer hover:underline">Xem thêm</Link>
                  </div>
                  <div className="imageandvideo_content mt-3">
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
                </div>
                <div className=" border-t border-gray-700"></div>


                <button onClick={handleDeleteGroup} className="btn btn-outline btn-secondary mt-10 w-full" >Xóa nhóm</button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          {/* more image */}
          {/* You can open the modal using document.getElementById('ID').showModal() method */}
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg">Tất cả ảnh và video</h3>
              <div className="d">
                <Carousel cols={4} gap={20} >
                  <Carousel.Item className="w-full max-h-[600px] object-contain mx-auto">
                    <Image
                      src={'https://img.daisyui.com/images/profile/demo/yellingcat@192.webp'} />
                  </Carousel.Item><Carousel.Item className="w-full max-h-[600px] object-contain mx-auto">
                    <Image src={'https://img.daisyui.com/images/profile/demo/yellingcat@192.webp'} />
                  </Carousel.Item>
                </Carousel>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          {/* add memeber */}
          <dialog id="modal_add_member_to_group" className="modal">
            <div className="modal-box ">
              <form method="dialog" className="">
                {/* if there is a button in form, it will close the modal */}
                <button id="close_add_member_to_group" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h3 className="font-bold text-lg">Thêm thành viên</h3>
                <div className="mt-3">
                  <label className="input btn btn-sm gap-2 transition-colors w-full mt-5 mb-5">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                    <input onChange={e => setSearchMemberValue(e.target.value)} type="search" className="grow" placeholder="Nhập tên hoặc email" />
                  </label>
                </div>
                <div className="border-b-2 border-indigo-500 w-full"></div>
                <div className="mt-3 ">
                  {
                    loading || debouncedValue.trim() === '' ?
                      members.length > 0 && members[0] !== null ?
                        members.map(m => (
                          <div key={m._id} className="p-2 hover:bg-indigo-500 hover:bg-opacity-5 btn btn-soft border-none bg-transparent w-full flex justify-start">
                            <input
                              name={m._id}
                              onChange={e => handleCheckMember(e)}
                              type="checkbox"
                              className="checkbox mr-3"
                            />
                            <p className="text-sm ">{m.fullName}</p>
                          </div>
                        ))
                        :
                        <p className="text-sm">Không tìm thấy tài khoản</p>
                      :
                      <Loader className="size-4 animate-spin" />
                  }
                </div>

                {
                  listMemberSelected.length > 0 ?
                    <>
                      <p className="text-sm mb-4 mt-4">Đã chọn</p>
                      <div className="list flex overflow-x-auto">
                        {
                          listMemberSelected.map(m => {
                            return (
                              <div key={m._id} className="item_select flex flex-col items-center w-24 relative">
                                <CircleX onClick={() => handleDeleteMemberChecked(m._id)} className="w-4 h-4 cursor-pointer absolute right-0 top-0" />
                                <div className="avatar">
                                  <div className="w-10 rounded-full">
                                    <img src={m.profilePic == "" ? DefaultUser : m.profilePic} />
                                  </div>
                                </div>
                                <p className="text-sm">{m.fullName}</p>
                              </div>
                            )
                          })
                        }
                      </div>
                    </> :
                    <></>
                }
                <div onClick={handleAddMemberToGroup} className="btn btn-soft rounded-full mt-4 w-full">
                  {loadingCreateGroup ? <Loader className="size-4 animate-spin" /> : 'Thêm thành viên'}
                </div>
              </form>
            </div>
          </dialog>

          {/* Avatar */}
          <Link to={`/profile/${selectedGroup._id}`}>
            <div className="avatar cursor-pointer">
              <div className="size-10 rounded-full relative">
                <img src={imageGroup || "/avatar.png"} alt={nameGroup} />
              </div>
            </div>
          </Link>

          {/* Group info */}
          <div>
            <h3 className="font-medium">{nameGroup}</h3>
          </div>
        </div>

        {/* profile */}
        <div className="f">
          <button onClick={() => document.getElementById('modal_add_member_to_group').showModal()} className="ml-2">
            <UserRoundPlus />
          </button>
          <button className="ml-4">
            <UserMinus onClick={() => document.getElementById('modal_delete_member').showModal()} />
          </button>
          <button className="ml-2">
            <EllipsisVertical onClick={() => document.getElementById('modal_more').showModal()} />
          </button>

          {/* Close button */}
          <button className="ml-6" onClick={() => setSelectedGroup(null)}>
            <X />
          </button>
        </div>
      </div >
    </div >
  );
};
export default ChatHeaderGroup;
