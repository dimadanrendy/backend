import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// export const GetAllDetailUsers = async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       include: {
//         posts_session: true,
//         posts_photos: true,
//         posts_videos: true,
//       },
//     });
//     return res.status(200).json({
//       status: true,
//       message: "Success",
//       data: users,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Please try again",
//       msg: error.message,
//     });
//   }
// };

export const GetUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json({
      status: true,
      message: "Success",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Please try again",
      msg: error.message,
    });
  }
};

export const PostUsers = (req, res) => {
  res.send("Hello World!");
};

export const PatchUsers = (req, res) => {
  res.send("Hello World!");
};

export const DeleteUsers = (req, res) => {
  res.send("Hello World!");
};

export const GetUsersById = (req, res) => {
  res.send("Hello World!");
};
