import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const UsersService = {
  async postUsers(req, res) {
    const { email, name, username, password, role, bidang, status } = req.body;

    try {
      // Cek apakah username sudah ada
      const existingUser = await prisma.user.findUnique({
        where: { username: username },
      });

      if (existingUser) {
        return res.status(400).json({
          status_code: 400,
          status: false,
          message: "Username already exists",
        });
      }

      const existingEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingEmail) {
        return res.status(400).json({
          status_code: 400,
          status: false,
          message: "Email already exists",
        });
      }

      // Hash password menggunakan bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan pengguna ke database
      const newUser = await prisma.user.create({
        data: {
          email: email,
          name: name,
          username: username,
          password: hashedPassword,
          role: role,
          bidang: bidang,
          status: status,
        },
      });

      // Kembalikan pengguna baru yang sudah disimpan
      return newUser;
    } catch (error) {
      return res.status(500).json({
        status_code: 500,
        status: false,
        message: "Internal server error",
      });
    }
  },

  async getUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id_users: true,
          email: true,
          name: true,
          username: true,
          role: true,
          bidang: true,
          status: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!users) {
        return res.status(404).json({
          status_code: 404,
          status: false,
          message: "Users not found",
        });
      }
      return users;
    } catch (error) {
      return res.status(500).json({
        status_code: 500,
        status: false,
        message: "Internal server error",
      });
    }
  },

  async getUsersById(id) {
    return await prisma.user.findUnique({
      where: { id_users: id },
      select: {
        id_users: true,
        email: true,
        name: true,
        username: true,
        role: true,
        bidang: true,
        status: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async deleteUser(id) {
    try {
      // Hapus pengguna
      const deletedUser = await prisma.user.delete({
        where: { id_users: id },
      });

      if (!deletedUser) {
        throw new Error("User not found");
      }

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async patchUsers(id, req) {
    try {
      if (req.confirmPassword !== req.password) {
        throw new Error("Password doesn't match");
      }

      delete req.confirmPassword;

      if (req.password) {
        const hashedPassword = await bcrypt.hash(req.password, 10);
        req.password = hashedPassword;
      }

      const user = await prisma.user.update({
        where: {
          id_users: id,
        },
        data: req,
      });

      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
