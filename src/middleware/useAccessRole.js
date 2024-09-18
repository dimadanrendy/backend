import { AuthService } from "../service/useAuthService.js";

export const useAccessRole = async (req, res, next) => {
  const session_user = req.headers["x-session-user"];

  if (!session_user) {
    return res.status(401).json({
      status_code: 401,
      status: false,
      message: "Unauthorized",
    });
  }

  const session = await AuthService.GetSessionAuth(session_user);

  if (session.status === false) {
    return res.status(session.status_code).json(session);
  }

  if (session.data?.role !== "admin" && session.data?.role !== "superadmin") {
    return res.status(403).json({
      status_code: 403,
      status: false,
      message: "Access denied",
    });
  }
  next();
};
