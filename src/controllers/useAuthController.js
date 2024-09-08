import { AuthService } from "../service/useAuthService.js";

export const GetAuth = async (req, res) => {};

export const PostAuth = async (req, res) => {
  // Panggil fungsi LoginSession dari AuthService dan serahkan req dan res
  const session = await AuthService.LoginSession(req);

  // Jika login gagal, kirim respons dengan pesan error
  if (session.status === false) {
    return res.status(400).json({
      status_code: 400,
      status: false,
      message: session.message,
      session: session.session_user ? session.session_user : null,
    });
  }

  res.cookie("session_id", session.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: session.session.expire_session,
  });

  // Jika login berhasil, kirim respons dengan session detail
  return res.status(200).json(session);
};

export const RefreshSession = async (req, res) => {
  const session = await AuthService.RefreshSession(req, res);
  if (session.status === false) {
    return res.status(400).json({
      status_code: 400,
      status: false,
      message: session.message,
    });
  }

  return res.status(200).json(session);
};

export const DeleteAuth = async (req, res) => {
  const session = await AuthService.LogoutSession(req, res);

  if (session.status === false) {
    return res.status(400).json({
      status_code: session.status_code,
      status: session.status,
      message: session.message,
      session: session ? session : null,
    });
  }

  res.clearCookie("session_id");

  return res.status(200).json(session);
};

export const GetAuthById = async (req, res) => {
  const { id } = req.params;
  const session = await AuthService.GetSessionById(id);

  if (session.status === false) {
    return res.status(400).json({
      status_code: session.status_code,
      status: session.status,
      message: session.message,
      session: session ? session : null,
    });
  }

  return res.status(200).json(session);
};
