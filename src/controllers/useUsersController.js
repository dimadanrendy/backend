import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prismaPrimary = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRIMARY_DATABASE_URL,
    },
  },
});

export const GetUsers = async (req, res) => {
  try {
    const users = await prismaPrimary.user.findMany();
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
