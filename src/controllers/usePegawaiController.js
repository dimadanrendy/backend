import { PegawaiService } from "../service/usePegawaiService.js";

export const GetPhotos = async (req, res) => {
  const photos = await PegawaiService.GetPhotos(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};

export const GetPhotosById = async (req, res) => {
  const photos = await PegawaiService.GetPhotosById(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};

export const GetPhotosByQuery = async (req, res) => {
  const photos = await PegawaiService.GetPhotosByQuery(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};

export const PostPhotos = async (req, res) => {
  const photos = await PegawaiService.PostPhotos(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }

  return res.status(photos.status_code).json(photos);
};

export const PatchPhotos = async (req, res) => {
  const photos = await PegawaiService.PatchPhotos(req);

  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};

export const DeletePhotos = async (req, res) => {
  const photos = await PegawaiService.DeletePhotos(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};
