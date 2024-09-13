import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // Untuk membuat refresh_session unik
import dotenv from "dotenv";
dotenv.config(); // Load env variables

const prisma = new PrismaClient();

export const AuthService = {
  async LoginSession(req) {
    try {
      const { input, password } = req.body;

      // Validasi input jika tidak ada
      if (!input || !password) {
        return {
          status_code: 400,
          status: false,
          message: "Input and password are required",
        };
      }

      const isEmail = /\S+@\S+\.\S+/.test(input);

      // Cek apakah session sudah ada
      const existingSession = await prisma.session.findFirst({
        where: isEmail ? { email: input } : { username: input },
      });

      if (existingSession) {
        return {
          status_code: 400,
          status: false,
          message: "Session already exists for this user",
        };
      }

      // Cari user berdasarkan username atau email
      const user = await prisma.user.findFirst({
        where: isEmail ? { email: input } : { username: input },
      });

      if (!user) {
        return {
          status_code: 404,
          status: false,
          message: "Invalid username or password",
        };
      }

      // Cek apakah password cocok
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          status_code: 404,
          status: false,
          message: "Invalid username or password",
        };
      }

      // Cek apakah user aktif
      if (!user.status) {
        return {
          status_code: 404,
          status: false,
          message: "User not active",
        };
      }

      // Tentukan expire_session dan refresh_session
      const expire_session = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
      const refresh_session = uuidv4(); // Menggunakan UUID untuk random string refresh_session

      // Buat session di database
      const session = await prisma.session.create({
        data: {
          authorId: user.id_users,
          role: user.role,
          username: user.username,
          email: user.email,
          expire_session: expire_session,
          refresh_session: refresh_session,
          status_login: true,
        },
      });

      // Return session object dan informasi user
      return {
        status_code: 200,
        status: true,
        message: "Login successful",
        session: {
          id: session.id_session,
          expire_session: expire_session,
          refresh_session: refresh_session,
        },
        user: {
          id: user.id_users,
          username: user.username,
          role: user.role,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async LogoutSession(req) {
    try {
      const session_id = req.headers["x-session-user"];
      const { id } = req.params;

      if ((!session_id && !id) || session_id !== id) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      const session = await prisma.session.findFirst({
        where: { authorId: id },
      });

      if (!session) {
        return {
          status_code: 404,
          status: false,
          message: "Session not found",
        };
      }

      // Hapus session di database
      await prisma.session.delete({
        where: { id_session: session.id_session },
      });
      return {
        status_code: 200,
        status: true,
        message: "Logout successful",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async RefreshSession(req, res) {
    try {
      const session_id = req.headers["x-session-user"];
      const { refresh_session } = req.params;

      if (!session_id && !refresh_session) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      const session = await prisma.session.findFirst({
        where: { refresh_session: refresh_session },
      });

      if (session.authorId !== session_id) {
        return {
          status_code: 404,
          status: false,
          message: "Session not found",
        };
      }

      const user = await prisma.user.findFirst({
        where: { id_users: session.authorId },
      });
      if (!user) {
        return {
          status_code: 404,
          status: false,
          message: "User not found",
        };
      }

      // cek jika session sudah expired
      if (session.expire_session < Date.now()) {
        // hapus cookie
        res.clearCookie("session_id");
        return {
          status_code: 400,
          status: false,
          message: "Session expired",
        };
      }

      const newRefreshSession = uuidv4();

      const expire_session = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

      const newSession = await prisma.session.update({
        where: { id_session: session.id_session },
        data: {
          expire_session: expire_session, // 7 days from now
          refresh_session: newRefreshSession,
        },
      });

      // hapus cookie
      res.clearCookie("session_id");

      res.cookie("session_id", newSession.id_session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: expire_session,
        sameSite: "strict",
      });

      return {
        status_code: 200,
        status: true,
        message: "Session refreshed",
        session: {
          id: session.id_session,
          expire_session: expire_session,
          refresh_session: newRefreshSession,
        },
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async GetSessionById(req) {
    try {
      const session_id = req.headers["x-session-user"];
      const { id } = req.params;

      if ((!session_id && !id) || session_id !== id) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }
      const session = await prisma.session.findFirst({
        where: { authorId: id },
      });

      if (!session) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      const user = await prisma.user.findFirst({
        where: { id_users: session.authorId },
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
        message: "Session found",
        session: {
          id: session.id_session,
          expire_session: session.expire_session,
          refresh_session: session.refresh_session,
        },
        user: {
          id: session.authorId,
          username: session.username,
          role: session.role,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },
};
