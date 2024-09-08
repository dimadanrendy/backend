import { UsersService } from "../service/useUsersService.js";

export const GetUsers = async (req, res) => {
  const users = await UsersService.getUsers();
  return res.status(200).json({
    status_code: 200,
    status: true,
    message: "Success",
    data: users,
  });
};

export const PostUsers = async (req, res) => {
  const user = await UsersService.postUsers(req);
  return res.status(201).json({
    status_code: 201,
    status: true,
    message: "User created successfully",
  });
};

export const PatchUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UsersService.patchUsers(id, req.body);
    return res.status(200).json({
      status_code: 200,
      status: true,
      message: "Success update user",
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        status_code: 404,
        status: false,
        message: error.message,
      });
    }

    if (error.message === "Password doesn't match") {
      return res.status(400).json({
        status_code: 400,
        status: false,
        message: error.message,
      });
    }
    // Jika kesalahan tidak spesifik
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};

export const DeleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UsersService.deleteUser(id);
    return res.status(200).json({
      status_code: 200,
      status: true,
      message: "Success delete user",
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        status_code: 404,
        status: false,
        message: error.message,
      });
    }
    // Jika kesalahan tidak spesifik
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};

export const GetUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status_code: 400,
        status: false,
        message: "ID is required",
      });
    }
    const user = await UsersService.getUsersById(id);

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        status: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      status_code: 200,
      status: true,
      message: "Success",
      data: user,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        status_code: 404,
        status: false,
        message: error.message,
      });
    }
    // Jika kesalahan tidak spesifik
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
    });
  }
};
