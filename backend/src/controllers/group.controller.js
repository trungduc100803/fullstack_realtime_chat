import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";

export const createGroup = async (req, res) => {
  const admin = req.user._id;
  const { name, image, members } = req.body

  const newGroup = new Group({
    admin,
    name,
    image,
    members: [admin, ...members]
  })
  await newGroup.save()

  // add group into user
  const adminUser = await User.findById(admin)
  adminUser.groups.push(newGroup._id)
  await adminUser.save()

  // add group into each member
  const a = await Promise.all(
    members.map(async m => {
      const res = await User.findById(m);
      res.groups.push(newGroup._id)
      await res.save()
      return res
    })
  );

  return res.status(200).json({
    message: 'create group success',
    newGroup
  })
}

export const getGroupForId = async (req, res) => {
  const { groupId } = req.params

  const group = await Group.findById(groupId)
    .populate("admin", "fullName profilePic email")

  return res.status(200).json({
    group
  })
}

export const getUserForGroup = async (req, res) => {
  const adminId = req.user._id
  const { groupId } = req.params

  const admin = await User.findById(adminId)
  const group = await Group.findById(groupId)
  if (!admin) return res.status(400).json({
    message: `ban khong phai admin`,
  })

  if (!group) return res.status(400).json({
    message: `khong tim thay nhom`,
  })

  const members = await Promise.all(
    group.members.map(async m => {
      const res = await User.findById(m);
      return res
    })
  );

  return res.status(200).json({
    message: `tat ca cac thanh vien trong nhom`,
    members
  })
}

export const deleteGroup = async (req, res) => {
  const adminId = req.user._id;
  const { groupId } = req.params

  const group = await Group.findById(groupId)
  const admin = await User.findById(adminId)
  if (!group || !admin) return res.status(400).json({
    message: `kho co group`,
  })
  if (group.admin._id.toString() !== adminId.toString()) return res.status(400).json({
    message: `ban khong phai admin`,
  })

  const index = admin.groups.indexOf(groupId);
  if (index !== -1) {
    admin.groups.splice(index, 1)
  }
  await admin.save()

  // delete group into each member
  const a = await Promise.all(
    group.members.map(async m => {
      const res = await User.findById(m);
      const index = res.groups.indexOf(groupId);
      if (index !== -1) {
        res.groups.splice(index, 1)
      }
      await res.save()
      return res
    })
  );
  await group.deleteOne()
  return res.status(200).json({
    message: 'delete group',
    status: true
  })

}


export const getGroupForUser = async (req, res) => {
  const userId = req.user._id

  const user = await User.findById(userId)
  if (!user) return res.status(400).json({ message: 'ko co user' })

  const a = await Promise.all(
    user.groups.map(async m => {
      const res = await Group.findById(m);
      return res
    })
  );

  return res.status(200).json({
    message: 'lay group thanh cong',
    groups: a
  })
}


export const addMemberToGroup = async (req, res) => {
  const userId = req.user._id;
  const { groupId } = req.params;
  const { membersId } = req.body

  const group = await Group.findById(groupId)
  const user = await User.findById(userId)
  if (!group || !user) return res.status(400).json({
    message: 'no group',
  })

  // add group into user
  const a = await Promise.all(
    membersId.map(async m => {
      const res = await User.findById(m);
      res.groups.push(groupId)
      await res.save()
      return res
    })
  );

  const b = await Promise.all(
    membersId.map(async m => {
      // add member into group
      group.members.push(m)
      await group.save()

    })
  );



  return res.status(200).json({
    message: `${user.fullName} da them vao nhom ${group.name}`,
    status: true
  })

}


export const deleteMemberInGroup = async (req, res) => {
  const userId = req.user._id;
  const { groupId } = req.params;
  const { membersId } = req.body

  const group = await Group.findById(groupId)
  const user = await User.findById(userId)
  if (!group || !user) return res.status(400).json({
    message: 'no group',
  })

  if (user._id.toString() !== group.admin._id.toString()) return res.status(400).json({
    message: 'ban khong phai admin',
  })

  console.log(membersId)

  // delete group in user
  const a = await Promise.all(
    membersId.map(async m => {
      const res = await User.findById(m);
      const index = res.groups.indexOf(groupId);
      if (index !== -1) {
        res.groups.splice(index, 1)
      }
      await res.save()
      return res
    })
  );

  // delete member in group
  const b = await Promise.all(
    membersId.map(async m => {
      const index1 = group.members.indexOf(m);
      if (index1 !== -1) {
        group.members.splice(index1, 1)
      }
      await group.save()
    })
  );

  return res.status(200).json({
    message: `da xoa nguoi dung khoi nhom`,
    status: true
  })

}


export const getAllImageInGroup = async (req, res) => {
  const { groupId } = req.params

  const group = await Group.findById(groupId)
  if (!group) return res.status(400).json({
    message: 'ko tim thay nhom'
  })

  const imageInGroup = await Message.find({
    groupId,
    image: { $exists: true }
  });

  return res.status(200).json({
    status: true,
    imageInGroup
  })

}


export const changeNameGroup = async (req, res) => {
  const adminId = req.user._id
  const { groupId } = req.params
  const { newName } = req.body

  const admin = await User.findById(adminId)
  const group = await Group.findById(groupId)
  if (!admin) return res.status(400).json({
    message: 'ban khong phai la admin',
    status: false
  })
  if (!group) return res.status(400).json({
    message: 'khong tim thay group',
    status: false
  })

  group.name = newName
  await group.save()

  return res.status(200).json({
    message: 'doi ten nhom thanh cong',
    status: true
  })

}

export const changeImageGroup = async (req, res) => {
  const adminId = req.user._id
  const { groupId } = req.params
  const { newImage } = req.body

  const admin = await User.findById(adminId)
  const group = await Group.findById(groupId)
  if (!admin) return res.status(400).json({
    message: 'ban khong phai la admin',
    status: false
  })
  if (!group) return res.status(400).json({
    message: 'khong tim thay group',
    status: false
  })

  group.image = newImage
  await group.save()


  return res.status(200).json({
    message: 'doi anh dai dien nhom thanh cong',
    status: true
  })

}
