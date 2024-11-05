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
        return {
          status_code: 400,
          status: false,
          message: "Username already exists",
        };
      }

      const existingEmail = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingEmail) {
        return {
          status_code: 400,
          status: false,
          message: "Email already exists",
        };
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

      return {
        status_code: 201,
        status: true,
        message: "User created successfully",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
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
        return {
          status_code: 404,
          status: false,
          message: "Users not found",
        };
      }
      return {
        status_code: 200,
        status: true,
        message: "Success",
        data: users,
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
    }
  },

  async getUsersById(id) {
    try {
      // Cek apakah user ada
      const user = await prisma.user.findUnique({
        where: { id_users: id },
      });

      if (!user) {
        return {
          status_code: 404,
          status: false,
          message: "User not found",
        };
      }

      return {
        status_code: 200,
        status: true,
        message: "Success",
        data: user,
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
    }
  },

  async deleteUser(id) {
    try {
      // Cek apakah user ada
      const user = await prisma.user.findUnique({
        where: { id_users: id },
      });

      if (!user) {
        return {
          status_code: 404,
          status: false,
          message: "User not found",
        };
      }

      if (user.email === "admin@gmai.com") {
        return {
          status_code: 400,
          status: false,
          message: "Cannot delete admin",
        };
      }

      // Hapus pengguna
      const deletedUser = await prisma.user.delete({
        where: { id_users: id },
      });

      return {
        status_code: 200,
        status: true,
        message: "Success delete user",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
    }
  },

  async patchUsers(id, req) {
    try {
      const { email, name, username, role, bidang, status } = req;

      // Jika cuman mengubah role
      if (!email && !name && !username && !bidang && !status) {
        const user = await prisma.user.update({
          where: {
            id_users: id,
          },
          data: {
            role: role,
          },
        });
        if (!user) {
          return {
            status_code: 404,
            status: false,
            message: "User not found",
          };
        }
        return {
          status_code: 200,
          status: true,
          message: "Success update user",
        };
      }

      // Jika mengubah email, name, username, role, bidang, status
      const user = await prisma.user.update({
        where: {
          id_users: id,
        },
        data: {
          email: email,
          name: name,
          username: username,
          role: role,
          bidang: bidang,
          status: status,
        },
      });

      if (!user) {
        return {
          status_code: 404,
          status: false,
          message: "User not found",
        };
      }
      return {
        status_code: 200,
        status: true,
        message: "Success update user",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
    }
  },
};
