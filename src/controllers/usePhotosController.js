import { PhotosService } from "../service/usePhotosService.js";

export const GetPhotos = async (req, res) => {
  try {
    const photos = await PhotosService.GetPhotos(req);
    if (photos.status === false) {
      return res.status(photos.status_code).json(photos);
    }
    return res.status(photos.status_code).json(photos);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};

export const PostPhotos = async (req, res) => {
  console.log(req.file);
  const photos = await PhotosService.PostPhotos(req);
  if (!photos) {
    return res.status(photos.status_code).json({
      status_code: photos.status_code,
      status: photos.status,
      message: photos.message,
    });
  }

  return res.status(photos.status_code).json(photos);
};

export const PatchPhotos = async (req, res) => {
  const photos = await PhotosService.PatchPhotos(req);

  if (!photos) {
    return res.status(photos.status_code).json({
      status_code: photos.status_code,
      status: photos.status,
      message: photos.message,
    });
  }
  return res.status(photos.status_code).json(photos);
};

export const DeletePhotos = async (req, res) => {
  const photos = await PhotosService.DeletePhotos(req);
  if (!photos) {
    return res.status(photos.status_code).json({
      status_code: photos.status_code,
      status: photos.status,
      message: photos.message,
    });
  }
  return res.status(photos.status_code).json(photos);
};

export const GetPhotosById = async (req, res) => {
  try {
    const photos = await PhotosService.GetPhotosById(req);
    if (photos.status === false) {
      return res.status(photos.status_code).json(photos);
    }
    return res.status(photos.status_code).json(photos);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};
