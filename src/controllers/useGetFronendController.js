import { FronendService } from "../service/useGetFrontendService.js";

export const GetPhotosByQuery = async (req, res) => {
  const photos = await FronendService.GetPhotosByQuery(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};
export const GetPegawaiByQuery = async (req, res) => {
  const photos = await FronendService.GetPegawaiByQuery(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};

export const GetDokumentsByQuery = async (req, res) => {
  const photos = await FronendService.GetDokumentsByQuery(req);
  if (!photos || photos.status === false) {
    return res.status(photos.status_code).json(photos);
  }
  return res.status(photos.status_code).json(photos);
};
