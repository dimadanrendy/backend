import { AuthService } from "../service/useAuthService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const useAccessToken = async (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET_KEY;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const { session_id } = req.cookies;

  if (!token && !session_id) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: "Unauthorized",
    });
  }

  const access_token = token || session_id;
  try {
    const decoded = await jwt.verify(access_token, jwtSecret);

    if (!decoded) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: "Unauthorized",
      });
    }

    if (decoded) {
      req.user = decoded;
    }
  } catch (error) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: "Unauthorized",
    });
  }

  next();
};

export const useRefreshToken = async (req, res, next) => {
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET_KEY;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const { session_id } = req.cookies;
  const { userId } = req.params;

  if (!session_id && !userId && !token) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: "Unauthorized",
    });
  }

  try {
    const decodedRefresh = await jwt.verify(session_id, jwtRefreshSecret);

    if (!decodedRefresh) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: "Unauthorized",
      });
    }
    if (decodedRefresh) {
      req.user = decodedRefresh;
    }
  } catch (error) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: "Unauthorized",
    });
  }

  next();
};
