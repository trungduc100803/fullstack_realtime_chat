import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";

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
