import { UsersService } from "../service/useUsersService.js";

export const GetUsers = async (req, res) => {
  try {
    const users = await UsersService.getUsers();

    if (users.status === false) {
      return res.status(users.status_code).json(users);
    }

    return res.status(users.status_code).json(users);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};

export const PostUsers = async (req, res) => {
  try {
    const user = await UsersService.postUsers(req);
    if (user.status === false) {
      return res.status(user.status_code).json(user);
    }
    return res.status(user.status_code).json(user);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};

export const PatchUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UsersService.patchUsers(id, req.body);

    if (user.status === false) {
      return res.status(user.status_code).json(user);
    }

    return res.status(user.status_code).json(user);
  } catch (error) {
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

    if (user.status === false) {
      return res.status(user.status_code).json(user);
    }

    return res.status(user.status_code).json(user);
  } catch (error) {
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

    if (user.status === false) {
      return res.status(user.status_code).json(user);
    }

    return res.status(user.status_code).json(user);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};
