import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, UserRoundPlus, Camera, BellRing, Loader, CircleX, ListCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import DefaultUser from '../constants/default_user.jpg'
import {decryptText} from '../lib/crypto'




const Navbar = () => {
  const [searchMessages, setSearchMessages] = useState([]);
  const [searchValue, setSearchValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCreateGroup, setLoadingCreateGroup] = useState(false);
  const [searchMemberValue, setSearchMemberValue] = useState('')
  const [groupValue, setGroupValue] = useState('')
  const { logout, authUser } = useAuthStore();
  const { userSearch, searchUser, users, groups, setSelectedUser, setSelectedGroup, setHighlightedMessageId  } = useChatStore();
  const fileInputRef = useRef(null);
  const [base64, setBase64] = useState('');
  const [checkedItems, setCheckedItems] = useState({});
  const [checkedList, setCheckedList] = useState([]);
  const [listMemberSelected, setListMemberSelected] = useState([]);

  const handleClickChooseImg = () => {
    fileInputRef.current.click();
  }

  const handleCreateGroup = async () => {
    // loading
    setLoadingCreateGroup(true)
    // call api create group
    const res = await axiosInstance.post('/groups/create-group', {
      name: groupValue,
      image: base64,
      members: checkedList
    })
    if (res.data) {
      // delete state close modal and loading
      setBase64('')
      setCheckedList([])
      setListMemberSelected([])
      setGroupValue('')
      document.getElementById('close_add_member').click()
      document.getElementById('btn-closeaddgroup').click()
      setLoadingCreateGroup(false)
      toast('Tạo nhóm thành công')
      return
    }
    setBase64('')
    setCheckedList([])
    setListMemberSelected([])
    setGroupValue('')
    document.getElementById('close_add_member').click()
    document.getElementById('btn-closeaddgroup').click()
    setLoadingCreateGroup(false)
    toast('Tạo nhóm không thành công')
  }

  const handleCheckMember = e => {
    const { name, checked } = e.target;
    setCheckedItems(prev => ({
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


  const handleAddGroup = (e) => {
    e.preventDefault()
    console.log('aa')
  }

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

  const handleAddMemberIntoGroup = () => {
    if (groupValue.trim() === '' || base64.trim() === '') {
      toast("Bạn hãy nhập đủ thông tin")
      return
    }
    document.getElementById('modal_add_member').showModal()
  }

  const handleOpenModalCreateGroup = () => {
    document.getElementById('modal_add_group').showModal()
    setBase64('')

  }

  const handleCloseModalCreateGroup = () => {
    setBase64('')
    setCheckedList([])
    setListMemberSelected([])
    setGroupValue('')
  }

  const handleChangeImgGroup = event => {
    const file = event.target.files[0]

    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64(reader.result); // base64 string sẽ nằm trong result
    };
    reader.readAsDataURL(file); // chuyển file ảnh thành base64
  }

  const searchMember = async e => {
    e.preventDefault();
    if (searchValue === '') {
      toast.error('Bạn chưa nhập thông tin');
      return;
    }
  
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchValue);
  
    if (isEmail) {
      try {
        await searchUser({ userEmailSearch: searchValue });
        if (userSearch.userSearch.email === searchValue) {
          document.getElementById('search_member').showModal();
          setSearchValue('');
        }
      } catch (error) {
        toast.error("Không tìm thấy người dùng");
      }
    } else {
      try {
        const [res1, res2] = await Promise.all([
          axiosInstance.get(`/messages/search-message/${searchValue}`),           // tin nhắn cá nhân
          axiosInstance.get(`/messages/search-group-message/${searchValue}`),    // tin nhắn nhóm
        ]);
        const all = [...res1.data.messages, ...res2.data.messages];
        setSearchMessages(all);
        document.getElementById('search_message_modal').showModal();
      } catch (error) {
        toast.error("Không tìm thấy tin nhắn");
      }
    }
  };
  

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

  //   const otherUserId = msg.senderId === authUser._id ? msg.receiverId : msg.senderId;
  //   const user = users.find(u => u._id === otherUserId);
  
  //   if (user) {
  //     setSelectedUser(user);
  //     setHighlightedMessageId(msg._id);  // 👈 set ID để focus vào trong ChatContainer
  //     document.getElementById('search_message_modal').close();
  //   } else {
  //     toast.error("Không tìm thấy người dùng trong danh sách");
  //   }
  // };

  const handleJumpToMessage = (msg) => {
    if (msg.groupId) {
      const group = groups.find(g => g._id === msg.groupId);
      if (group) {
        setSelectedGroup(group);
        setSelectedUser(null);
        setHighlightedMessageId(msg._id);
        document.getElementById('search_message_modal').close();
      }
    } else {
      const otherUserId = msg.senderId === authUser._id ? msg.receiverId : msg.senderId;
      const user = users.find(u => u._id === otherUserId);
      if (user) {
        setSelectedUser(user);
        setSelectedGroup(null);
        setHighlightedMessageId(msg._id);
        document.getElementById('search_message_modal').close();
      }
    }
  };

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        {/* modal search message */}

        <dialog id="search_message_modal" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <h3 className="font-bold text-lg">Kết quả tin nhắn</h3>
              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                {searchMessages.length > 0 ? (
                  searchMessages.map((msg, idx) => {
                    const isFromGroup = !!msg.groupId;

                    const sender =
                      msg.senderId === authUser._id
                        ? authUser
                        : users.find((u) => u._id === msg.senderId);

                    const group =
                      isFromGroup && groups.find((g) => g._id === msg.groupId);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleJumpToMessage(msg)}
                        className="block w-full text-left p-3  rounded hover:bg-base-200"
                      >
                        {/* Group Info nếu là tin nhắn nhóm */}
                        {isFromGroup && group && (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <img
                                src={group.image || "/avatar.png"}
                                alt="group"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-xs text-zinc-400 font-semibold">
                              Trong nhóm: {group.name}
                            </div>
                          </div>
                        )}

                        {/* Sender info */}
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 rounded-full overflow-hidden border">
                            <img
                              src={sender?.profilePic || "/avatar.png"}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-sm font-medium text-zinc-100">
                            {sender?.fullName || "Người gửi"}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 mb-1">
                          Gửi lúc: {new Date(msg.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-zinc-300 truncate">{decryptText(msg.text, msg.iv)}</p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500">Không có tin nhắn phù hợp</p>
                )}
              </div>
            </form>
          </div>
        </dialog>

        {/*  */}
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={searchMember} className="input btn btn-sm gap-2 transition-colors  ">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
              <input value={searchValue} onChange={e => setSearchValue(e.target.value)} type="search" className="grow" placeholder="Tìm thêm bạn mới" />
              <kbd className="kbd kbd-sm">⌘</kbd>
              <kbd className="kbd kbd-sm">K</kbd>
            </form>
            <div onClick={handleOpenModalCreateGroup} className="btn btn-sm gap-2 transition-colors">
              <UserRoundPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo nhóm</span>
            </div>
            <Link
              to={"/notifycation"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >

              <BellRing className="w-4 h-4" />
              <span className="hidden sm:inline">Thông báo</span>
            </Link>

            <Link
              to={"/request-friend"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >

              <UserRoundPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Lời mời kết bạn</span>
            </Link>

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Cài đặt</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Tài khoản</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <dialog id="modal_add_group" className="modal">
        <div className="modal-box ">
          <form method="dialog" className="">
            {/* if there is a button in form, it will close the modal */}
            <button onClick={handleCloseModalCreateGroup} id="btn-closeaddgroup" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <h3 className="font-bold text-lg">Tạo nhóm</h3>
            <div className="mt-6">
              <div className="flex items-center gap-2">
                {
                  base64 !== '' ?
                    <div onClick={handleClickChooseImg} className="avatar">
                      <div className="w-11 rounded-full">
                        <img src={base64} />
                      </div>
                      <input onChange={e => handleChangeImgGroup(e)} ref={fileInputRef} type="file" name="" hidden id="" />
                    </div>
                    :
                    <div onClick={handleClickChooseImg} className="btn btn-soft rounded-full">
                      <input onChange={e => handleChangeImgGroup(e)} ref={fileInputRef} type="file" name="" hidden id="" />
                      <Camera className="size-5" />
                    </div>
                }
                <div className="border-b-2 border-indigo-500 w-full">
                  <input value={groupValue} type="text" onChange={e => setGroupValue(e.target.value)} className="grow outline-none w-full p-2" placeholder="Đặt tên nhóm" />
                </div>
              </div>
              <div onClick={handleAddMemberIntoGroup} className="btn mt-5 btn-sm gap-2 transition-colors">
                <UserRoundPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Thêm thành viên</span>
              </div>

            </div>
          </form>
        </div>
      </dialog>

      <dialog id="modal_add_member" className="modal">
        <div className="modal-box ">
          <form method="dialog" className="">
            {/* if there is a button in form, it will close the modal */}
            <button id="close_add_member" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
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
            <div onClick={handleCreateGroup} className="btn btn-soft rounded-full mt-4 w-full">
              {loadingCreateGroup ? <Loader className="size-4 animate-spin" /> : 'Tạo nhóm'}
            </div>
          </form>
        </div>
      </dialog>

      <dialog id="search_member" className="modal">
        <div className="modal-box ">
          <form method="dialog" className="">
            {/* if there is a button in form, it will close the modal */}
            <button id="close_search_member" className=" btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <h3 className="font-bold text-lg">Kết quả</h3>
            <div className="mt-6">
              {/* item search */}
              {
                userSearch.userSearch &&
                <Link to={`/profile/${userSearch.userSearch.email}/${userSearch.userSearch._id}`} onClick={() => document.getElementById('close_search_member').click()}>
                  <div className="p-2 hover:bg-indigo-500 hover:bg-opacity-5 btn btn-soft border-none bg-transparent w-full flex justify-start">
                    <div className="w-8 overflow-hidden  rounded-full">
                      <img src={userSearch.userSearch.profilePic === '' ? 'data:image/png;base64,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' : userSearch.userSearch.profilePic} />
                    </div>
                    <p className="text-sm ">{userSearch.userSearch.fullName}</p>
                  </div>
                </Link>
              }

              {/* search empty */}
              {/* <div className="w-full flex items-center justify-center h-20">
                <p className="m-auto">Không tìm thấy kết quả</p>
              </div> */}
            </div>
          </form>
        </div>
      </dialog>
    </header>
  );
};
export default Navbar;
