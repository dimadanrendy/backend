import { AuthService } from "../service/useAuthService.js";

export const GetAuth = async (req, res) => {};

export const PostAuth = async (req, res) => {
  // Panggil fungsi LoginSession dari AuthService dan serahkan req dan res
  const session = await AuthService.LoginSession(req, res);

  // Jika login gagal, kirim respons dengan pesan error
  if (session.status === false) {
    if (session.reset_cookies === true) {
      res.clearCookie("X_ACCESS_TOKEN");
      res.clearCookie("X_REFRESH_TOKEN");

      return res.status(session.status_code).json(session);
    }
    return res.status(session.status_code).json(session);
  }

  // Jika login berhasil, kirim respons dengan session detail
  return res.status(session.status_code).json(session);
};

export const RefreshSession = async (req, res) => {
  const session = await AuthService.RefreshSession(req, res);
  if (session.status === false) {
    return res.status(session.status_code).json(session);
  }

  return res.status(session.status_code).json(session);
};

export const DeleteAuth = async (req, res) => {
  const session = await AuthService.LogoutSession(req, res);

  if (session.status === false) {
    return res.status(session.status_code).json(session);
  }
  res.clearCookie("X_REFRESH_TOKEN");
  res.clearCookie("X_ACCESS_TOKEN");
  return res.status(session.status_code).json(session);
};

export const GetAuthById = async (req, res) => {
  const session = await AuthService.GetSessionById(req);

  if (session.status === false) {
    return res.status(session.status_code).json(session);
  }

  return res.status(session.status_code).json(session);
};
