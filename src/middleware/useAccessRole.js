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

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        status: false,
        message: "Unauthorized",
      });
    }
    req.user = decoded;
  });

  if (!req.user) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({
      status_code: 403,
      status: false,
      message: "Access denied",
    });
  }
  next();
};
