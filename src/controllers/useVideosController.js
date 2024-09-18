import { VidoesService } from "../service/useVideosService.js";

export const GetVideos = async (req, res) => {
  try {
    const videos = await VidoesService.GetVidoes(req);
    if (videos.status === false) {
      return res.status(videos.status_code).json(videos);
    }
    return res.status(videos.status_code).json(videos);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};

export const PostVideos = async (req, res) => {
  const videos = await VidoesService.PostVideos(req);
  if (!videos) {
    return res.status(videos.status_code).json({
      status_code: videos.status_code,
      status: videos.status,
      message: videos.message,
    });
  }

  return res.status(videos.status_code).json(videos);
};

export const PatchVideos = async (req, res) => {
  const videos = await VidoesService.PatchVideos(req);

  if (!videos) {
    return res.status(videos.status_code).json({
      status_code: videos.status_code,
      status: videos.status,
      message: videos.message,
    });
  }
  return res.status(videos.status_code).json(videos);
};

export const DeleteVideos = async (req, res) => {
  const videos = await VidoesService.DeleteVideos(req);
  if (!videos) {
    return res.status(videos.status_code).json({
      status_code: videos.status_code,
      status: videos.status,
      message: videos.message,
    });
  }
  return res.status(videos.status_code).json(videos);
};

export const GetVideosById = async (req, res) => {
  try {
    const videos = await VidoesService.GetVideosById(req);
    if (videos.status === false) {
      return res.status(videos.status_code).json(videos);
    }
    return res.status(videos.status_code).json(videos);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};
