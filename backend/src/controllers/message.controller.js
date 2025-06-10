import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import {decryptText} from '../lib/crypto.js'

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const user = await User.findOne({ _id: loggedInUserId })
    const filteredUsers = user.conversation
    const filteredGroups = user.groups

    const arrUser = await Promise.all(
      filteredUsers.map(async u => {
        const res = await User.findById(u);
        return res;
      })
    );
    const arrGroup = await Promise.all(
      filteredGroups.map(async u => {
        const res = await Group.findById(u)
          .populate("admin", "fullName profilePic email")

        if (res !== null) return res;
      })
    );
    res.status(200).json({
      arrUser,
      arrGroup
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)
    return res.status(200).json({
      message: 'ok',
      user
    })
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const searchUser = async (req, res) => {
  try {
    const userEmailSearched = req.body.userEmailSearch
    const loggedInUserId = req.user._id
    if (!userEmailSearched || !loggedInUserId) {
      return res.status(400).json({
        message: "ko du thong tin"
      });
    }

    const userSearch = await User.findOne({ email: userEmailSearched })
    if (!userSearch) {
      return res.status(404).json({
        message: "ko tim thay user"
      });
    }

    return res.status(200).json({
      userSearch
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Không tìm thấy tài khoản'
    });
  }
}



export const addFriend = async (req, res) => {
  try {
    const { userIdAddFriend } = req.body
    const loggedInUserId = req.user._id
    if (!userIdAddFriend || !loggedInUserId) {
      return res.status(400).json({
        message: "ko du thong tin"
      });
    }

    const user = await User.findById(userIdAddFriend)
    if (user.addFriend.includes(loggedInUserId)) {
      return res.status(400).json({
        message: "da gui ket ban"
      });
    }
    user.addFriend.push(loggedInUserId)
    await user.save()
    const self = await User.findById(loggedInUserId)

    const receiverSocketId = getReceiverSocketId(userIdAddFriend);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("addFriend", self);
    }

    return res.status(200).json({
      message: 'addfriend success',
      user
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Không tìm thấy tài khoản'
    });
  }

}

export const getUserForName = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    const { name } = req.params

    const user = await User.findById(loggedInUserId)
    const cleanInput = (str) => str.replace(/\s+/g, '').toLowerCase();
    const arr = await Promise.all(
      user.friends.map(async u => {
        const res = await User.findById(u);
        const nameU = cleanInput(res.fullName)
        const cleaned = cleanInput(name)
        const uniqueChars = [...new Set(cleaned.split(''))]; // loại trùng lặp
        const hasMatch = uniqueChars.some(char => nameU.includes(char));
        if (hasMatch) {
          return res
        }
      })
    );


    return res.status(200).json({
      message: 'ok',
      arr
    })
  } catch (error) {

  }
}

export const cancelAddFriend = async (req, res) => {
  try {
    const { userIdCancelAddFriend } = req.body
    const loggedInUserId = req.user._id
    if (!userIdCancelAddFriend || !loggedInUserId) {
      return res.status(400).json({
        message: "ko du thong tin"
      });
    }

    const user = await User.findById(userIdCancelAddFriend)
    const index = user.addFriend.indexOf(loggedInUserId);
    if (index !== -1) {
      user.addFriend.splice(index, 1);
    }
    await user.save()

    return res.status(200).json({
      message: 'da huy ket ban',
      user
    });
  } catch (error) {

  }
}

export const cancelInviteFriend = async (req, res) => {
  try {
    const { userIdCancelAddFriend } = req.body
    const loggedInUserId = req.user._id
    if (!userIdCancelAddFriend || !loggedInUserId) {
      return res.status(400).json({
        message: "ko du thong tin"
      });
    }

    const user = await User.findById(loggedInUserId)
    const index = user.addFriend.indexOf(userIdCancelAddFriend);
    if (index !== -1) {
      user.addFriend.splice(index, 1);
    }
    await user.save()

    return res.status(200).json({
      message: 'da huy ket ban',
      user
    });
  } catch (error) {

  }
}


export const checkFriend = async (req, res) => {
  try {
    const { emailCheck } = req.body
    const loggedInUserId = req.user._id

    if (!emailCheck || !loggedInUserId) {
      return res.status(400).json({
        message: "ko du thong tin"
      });
    }

    const userCheck = await User.findOne({ email: emailCheck })
    if (!userCheck) {
      return res.status(400).json({
        message: "ko tim thay user check"
      });
    }

    if (userCheck.addFriend.includes(loggedInUserId)) {
      return res.status(200).json({
        message: "da gui loi moi ket ban",
        status: -1
      });
    } else if (userCheck.friends.includes(loggedInUserId)) {
      return res.status(200).json({
        message: "da la ban be",
        status: 1
      });
    } else {
      return res.status(200).json({
        message: "chua ket ban",
        status: 0
      });
    }

  } catch (error) {

  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, fileType, iv, fileName } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let fileUrl;
    let fileSize

    if (file && fileType) {
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "raw", // Cho phép zip/pdf/ppt...
      });
      fileUrl = uploadResponse.secure_url;
      fileSize = uploadResponse.bytes;
    }


    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      iv,
      image: imageUrl,
      file: fileUrl,
      fileType,
      fileName,
      fileSize
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", { newMessage, iv });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image, iv } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;

//     let imageUrl;
//     if (image) {
//       // Upload base64 image to cloudinary
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }


//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl,
//       iv
//     });

//     await newMessage.save();

//     const receiverSocketId = getReceiverSocketId(receiverId);
//     const data = {
//       newMessage, iv
//     }
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", (data));
//     }

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.log("Error in sendMessage controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const getMessagesGroups = async (req, res) => {
  try {
    const { id: groupId } = req.params;

    const messages = await Message.find({ groupId }).populate("senderId", "fullName profilePic").sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting group messages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const sendMessageGroup = async (req, res) => {
  try {
        const { text, image, file, fileType, iv, fileName } = req.body;
    const { id: groupReceiverId } = req.params;
    const senderId = req.user._id;

    // Optional: upload ảnh nếu có
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Kiểm tra group tồn tại
    const group = await Group.findById(groupReceiverId).populate("members", "_id");
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Tạo 1 message duy nhất với groupId
    // const newMessage = new Message({
    //   senderId,
    //   groupId: groupReceiverId,
    //   text,
    //   image: imageUrl,
    // });
    // await newMessage.save();
    let fileUrl;
    let fileSize

    if (file && fileType) {
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "raw", // Cho phép zip/pdf/ppt...
      });
      fileUrl = uploadResponse.secure_url;
      fileSize = uploadResponse.bytes;
    }


    const newMessage = new Message({
      senderId,
      groupId: groupReceiverId,
      text,
      iv,
      image: imageUrl,
      file: fileUrl,
      fileType,
      fileName,
      fileSize
    });

    await newMessage.save();
    // 
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "fullName profilePic");

    // Gửi đến tất cả thành viên trong group qua room
    io.to(groupReceiverId).emit("newMessageGroup", populatedMessage);

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessageGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNotifyAddFriend = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    const user = await User.findById(loggedInUserId)
    if (!user) {
      return res.status(400).json({
        message: 'ko tim thay user'
      })
    }

    const arr = await Promise.all(
      user.addFriend.map(async u => {
        const res = await User.findById(u);
        return res;
      })
    );

    return res.status(200).json({
      message: 'get noti add friend success',
      notiAddFriend: arr
    })
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const acceptAddFriend = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    const { userIdAddFriend } = req.body

    const user = await User.findById(loggedInUserId)
    const userAddFriend = await User.findById(userIdAddFriend)
    if (!user) {
      return res.status(400).json({
        message: 'ko tim thay user'
      })
    }

    const index = user.addFriend.indexOf(userIdAddFriend);
    if (index !== -1) {
      user.addFriend.splice(index, 1);
    }
    user.friends.push(userIdAddFriend)
    user.conversation.push(userIdAddFriend)
    userAddFriend.friends.push(loggedInUserId)
    userAddFriend.conversation.push(loggedInUserId)
    await userAddFriend.save()
    await user.save()

    return res.status(200).json({
      message: 'accept',
      user
    })
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const deleteFriend = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    const { userIdDeleteFriend } = req.body

    const user = await User.findById(loggedInUserId)
    const userDeleteFriend = await User.findById(userIdDeleteFriend)
    if (!user) {
      return res.status(400).json({
        message: 'ko tim thay user'
      })
    }

    const index1 = user.friends.indexOf(userIdDeleteFriend);
    const index2 = user.conversation.indexOf(userIdDeleteFriend);
    const index3 = userDeleteFriend.friends.indexOf(loggedInUserId);
    const index4 = userDeleteFriend.conversation.indexOf(loggedInUserId);
    if (index1 !== -1) {
      user.friends.splice(index1, 1)
    }
    if (index2 !== -1) {
      user.conversation.splice(index2, 1)
    }
    if (index3 !== -1) {
      userDeleteFriend.friends.splice(index3, 1)
    }
    if (index4 !== -1) {
      userDeleteFriend.conversation.splice(index4, 1)
    }
    await userDeleteFriend.save()
    await user.save()

    return res.status(200).json({
      message: 'accept',
    })
  } catch (error) {
    console.log("Error in deleteFriend controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}