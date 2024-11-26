import { AuthService } from "../service/useAuthService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const useAccessRole = async (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET_KEY;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = await jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded;
    });

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

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: "Unauthorized",
      });
    }

    // if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    //   return res.status(403).json({
    //     status_code: 403,
    //     status: false,
    //     message: "Access denied",
    //   });
    // }
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
  next();
};
