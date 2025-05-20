import { PengaduanService } from "../service/usePengaduanService.js";

export const GetPhotosByBerita = async (req, res) => {
  try {
    const photos = await PhotosService.GetPhotosByQueryBerita(req);
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

export const PostPengaduan = async (req, res) => {
  const pengaduan = await PengaduanService.PostPengaduan(req);
  if (!pengaduan) {
    return res.status(pengaduan.status_code).json({
      status_code: pengaduan.status_code,
      status: pengaduan.status,
      message: pengaduan.message,
    });
  }

  return res.status(pengaduan.status_code).json(pengaduan);
};

export const GetStatusPengaduan = async (req, res) => {
  const pengaduan = await PengaduanService.GetStatusPengaduan(req);

  if (!pengaduan) {
    return res.status(pengaduan.status_code).json({
      status_code: pengaduan.status_code,
      status: pengaduan.status,
      message: pengaduan.message,
    });
  }

  return res.status(pengaduan.status_code).json(pengaduan);
};

export const GetAllPengaduan = async (req, res) => {
  const pengaduan = await PengaduanService.GetAllPengaduan(req);
  if (!pengaduan) {
    return res.status(pengaduan.status_code).json({
      status_code: pengaduan.status_code,
      status: pengaduan.status,
      message: pengaduan.message,
    });
  }

  return res.status(pengaduan.status_code).json(pengaduan);
};
