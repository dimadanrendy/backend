import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // Untuk membuat refresh_session unik
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config(); // Load env variables

const prisma = new PrismaClient();

export const AuthService = {
  async GetSessionAuth(id) {
    try {
      const session_id = id;

      const session = await prisma.session.findFirst({
        where: { authorId: session_id },
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
  async LoginSession(req, res) {
    try {
      const jwtSecret = process.env.JWT_SECRET_KEY;
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET_KEY;
      const { input, password } = req.body;

      // Validasi input jika tidak ada
      if (!input || !password) {
        return {
          status_code: 400,
          status: false,
          message: "Input and password are required",
        };
      }

      // format email
      const isEmail = /\S+@\S+\.\S+/.test(input);

      // Cek apakah session sudah ada
      const existingSession = await prisma.session.findFirst({
        where: isEmail ? { email: input } : { username: input },
      });

      // Cek apakah session sudah ada
      if (existingSession) {
        await prisma.session.delete({
          where: { authorId: existingSession.authorId },
        });
        return {
          status_code: 400,
          status: false,
          reset_cookies: true,
          message: "Session already exists for this user",
        };
      }

      // Cari user berdasarkan username atau email
      const user = await prisma.user.findFirst({
        where: isEmail ? { email: input } : { username: input },
      });

      // Cek apakah user ada
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
      const expire_session = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1); // 1 days from now

      // jwt payload
      const payload = {
        id: user.id_users,
        role: user.role,
        username: user.username,
        email: user.email,
        name: user.name,
        image: user.image,
      };

      // Buat jwt access token
      const access_token = jwt.sign(payload, jwtSecret, {
        expiresIn: "15m",
      });

      // Buat jwt refresh token
      const refresh_token = jwt.sign(payload, jwtRefreshSecret, {
        expiresIn: "1h",
      });

      // Set cookie
      res.cookie("session_id", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Buat session di database
      const session = await prisma.session.create({
        data: {
          authorId: user.id_users,
          role: user.role,
          username: user.username,
          email: user.email,
          expire_session: expire_session,
          refresh_session: refresh_token,
          status_login: true,
        },
      });

      // Return session object dan informasi user
      return {
        status_code: 200,
        status: true,
        message: "Login successful",
        user: {
          id: user.id_users,
          username: user.username,
          role: user.role,
          email: user.email,
          name: user.name,
          image: user.image,
        },
        access_token: access_token,
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
      const { id: session_id } = req.user;
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
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET_KEY;
      const { session_id } = req.cookies;
      const jwtSecret = process.env.JWT_SECRET_KEY;
      const { userId } = req.params;

      // Cek apakah session_id valid
      const session = await prisma.session.findFirst({
        where: { refresh_session: session_id },
      });
      if (!session) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }
      if (session.authorId !== userId) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      // Verifikasi refresh token menggunakan session_id
      jwt.verify(session_id, jwtRefreshSecret, (err, decoded) => {
        if (err) {
          return {
            status_code: 403,
            status: false,
            message: "Invalid refresh token",
          };
        }
        req.payloadUser = decoded;
      });

      if (!req.payloadUser) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      const { id, role, username, email, name, image } = req.payloadUser;

      const newToken = jwt.sign(
        { id, role, username, email, name, image },
        jwtSecret,
        {
          expiresIn: "15m",
        }
      );

      const newRefreshToken = jwt.sign(
        { id, role, username, email, name, image },
        jwtRefreshSecret,
        {
          expiresIn: "1h",
        }
      );

      const expire_session = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1);

      // Update session
      await prisma.session.update({
        where: { id_session: session.id_session },
        data: {
          expire_session: expire_session, // 1 hari dari sekarang
          refresh_session: newRefreshToken,
        },
      });

      // Hapus cookie lama
      res.clearCookie("session_id");

      // Set cookie baru dengan token yang baru
      res.cookie("session_id", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1 hari dalam milidetik
      });

      return {
        status_code: 200,
        status: true,
        message: "Session refreshed",
        access_token: newToken,
      };
    } catch (error) {
      console.log(error);
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async GetSessionById(req) {
    try {
      const { id: session_id } = req.user;
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
