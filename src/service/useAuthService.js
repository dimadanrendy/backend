import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // Untuk membuat refresh_session unik
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import redis from "redis";

dotenv.config(); // Load env variables

const prisma = new PrismaClient();

// cek prisma apaka sudah konek
prisma
  .$connect()
  .then(() => {
    console.log("- Prisma Client connected");
  })
  .catch((err) => {
    console.log("Prisma connection error", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// cek redis apakah sudah konek
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

redisClient.on("connect", () => {
  console.log("- Redis Client Connected");
});

redisClient.connect();

export const AuthService = {
  async GetSessionAuth(id) {
    try {
      const session_id = id;

      // const session = await prisma.session.findFirst({
      //   where: { authorId: session_id },
      // });

      // Cek session_id dan user_id null
      if (!session_id) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      // Cek session di redis
      const data = await redisClient.get(session_id);
      const session = JSON.parse(data);

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
  async LoginSession(req, res) {
    console.log("login");
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
      // const existingSession = await prisma.session.findFirst({
      //   where: isEmail ? { email: input } : { username: input },
      // });

      // Cek apakah session sudah ada
      // if (existingSession) {
      //   await prisma.session.delete({
      //     where: { authorId: existingSession.authorId },
      //   });
      //   return {
      //     status_code: 400,
      //     status: false,
      //     reset_cookies: true,
      //     message: "Session already exists for this user",
      //   };
      // }

      // Cek redis apakah session ada

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

      // Cek redis apakah session ada
      const session = await redisClient.get(user.id_users);
      if (session) {
        await redisClient.del(user.id_users);
        return {
          status_code: 400,
          status: false,
          message: "Session already exists for this user",
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
      // jwt payload
      const payload = {
        id: user.id_users,
        username: user.username,
        role: user.role,
        email: user.email,
        name: user.name,
        bidang: user.bidang,
      };

      // Buat jwt access token
      const access_token = jwt.sign(payload, jwtSecret, {
        expiresIn: "1h",
      });

      // Buat jwt refresh token
      const refresh_token = jwt.sign(payload, jwtRefreshSecret, {
        expiresIn: "2h",
      });

      // ambil jam sekarang

      // Set cookie
      res.cookie("X_REFRESH_TOKEN", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
      });

      res.cookie("X_ACCESS_TOKEN", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
      });

      // Set redis
      await redisClient.set(user.id_users, JSON.stringify(payload));

      await redisClient.expire(user.id_users, 7200);

      // Return session object dan informasi user
      return {
        status_code: 200,
        status: true,
        message: "Login successful",
        user: payload,
        access_token: access_token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async LogoutSession(req, res) {
    try {
      const { id: session_id } = req.user;

      if (!session_id) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      // const session = await prisma.session.findFirst({
      //   where: { authorId: id },
      // });

      // Cek redis apakah session ada
      const session = await redisClient.get(session_id);

      if (!session) {
        return {
          status_code: 404,
          status: false,
          message: "Session not found",
        };
      }

      // Delete redis
      await redisClient.del(session_id);
      res.clearCookie("X_REFRESH_TOKEN");

      res.clearCookie("X_ACCESS_TOKEN");

      // Hapus session di database
      // await prisma.session.delete({
      //   where: { id_session: session.id_session },
      // });
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
    const jwtSecret = process.env.JWT_SECRET_KEY;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET_KEY;
    try {
      const { id: userId } = req.user;
      // Cek redis apakah session ada
      const data = await redisClient.get(userId);
      const session = JSON.parse(data);

      if (!session) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }
      if (session.id !== userId) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      const { id, role, username, email, name, image } = session;
      const newToken = jwt.sign(
        { id, role, username, email, name, image },
        jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      const newRefreshToken = jwt.sign(
        { id, role, username, email, name, image },
        jwtRefreshSecret,
        {
          expiresIn: "2h",
        }
      );

      // Update redis
      await redisClient.set(userId, JSON.stringify(session));
      await redisClient.expire(userId, 7200);

      // Set cookie baru dengan token yang baru
      res.cookie("X_REFRESH_TOKEN", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // buat jadi zona waktu indoensia
        expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
      });

      res.cookie("X_ACCESS_TOKEN", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // buat jadi zona waktu indoensia
        expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
        // maxAge: 1000 * 60 * 60 * 2,
      });

      return {
        status_code: 200,
        status: true,
        message: "Session refreshed",
        user: {
          id: id,
          role: role,
          username: username,
          email: email,
          name: name,
          image: image,
        },
        access_token: newToken,
        refresh_token: newRefreshToken,
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
      const { id: session_id } = req.user;
      const { id } = req.params;

      if ((!session_id && !id) || session_id !== id) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }
      const data = await redisClient.get(id);
      const session = JSON.parse(data);

      if (!session) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      return {
        status_code: 200,
        status: true,
        message: "Session found",
        user: {
          id: session.id,
          username: session.username,
          role: session.role,
          email: session.email,
          name: session.name,
          bidang: session.bidang,
          image: session.image,
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
