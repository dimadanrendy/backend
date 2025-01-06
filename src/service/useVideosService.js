import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const VideosService = {
  async GetVideos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;

      // cek role user apakah admin jika admin atau super admin tampilkan semua dokumen
      if (role === "admin" || role === "superadmin") {
        const videos = await prisma.videos.findMany();

        if (!videos) {
          return {
            status_code: 404,
            status: false,
            message: "Video not found",
          };
        }
        const videosWithUrls = videos.map((video) => ({
          ...video,
          videoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/videos/${video.file}`,
        }));
        return {
          status_code: 200,
          status: true,
          data: videosWithUrls,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const videos = await prisma.videos.findMany({
        where: { authorId: user_id },
      });

      if (!videos) {
        return {
          status_code: 404,
          status: false,
          message: "Video not found",
        };
      }

      const videosWithUrls = videos.map((video) => ({
        ...video,
        videoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/videos/${video.file}`,
      }));

      return {
        status_code: 200,
        status: true,
        data: videosWithUrls,
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
        message_error: error.message,
      };
    }
  },

  async GetVideosById(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { id } = req.params;
      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (role === "admin" || role === "superadmin") {
        const videos = await prisma.videos.findUnique({
          where: { id_videos: parseInt(id) },
        });

        if (!videos) {
          return {
            status_code: 404,
            status: false,
            message: "Videos not found",
          };
        }
        const videosWithUrls = videos.map((video) => ({
          ...video,
          videoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/image/${video.file}`,
        }));
        return {
          status_code: 200,
          status: true,
          data: videosWithUrls,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const videos = await prisma.videos.findUnique({
        where: { id_videos: parseInt(id), authorId: user_id },
      });

      if (!videos) {
        return {
          status_code: 404,
          status: false,
          message: "Videos not found",
        };
      }
      const videosWithUrls = videos.map((video) => ({
        ...video,
        videoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/videos/${video.file}`,
      }));
      return {
        status_code: 200,
        status: true,
        data: videosWithUrls,
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
        message_error: error.message,
      };
    }
  },

  async PostVideos(data) {
    try {
      const { id: user_id, role, username, email } = data.user;
      const { filename } = data.file;
      const { judul, tipe, deskripsi, bidang, tanggal } = data.body;
      const published = true;
      const file = filename;

      const videos = await prisma.videos.create({
        data: {
          judul: judul,
          tipe: tipe,
          tanggal: tanggal,
          bidang: bidang,
          deskripsi: deskripsi,
          published: published,
          file: file,
          authorId: user_id,
          authorUsername: username,
        },
      });
      return {
        status_code: 201,
        status: true,
        message: "Video created",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async PatchVideos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { id } = req.params;
      const { filename } = req.file;
      const { judul, untuk, deskripsi, bidang, tanggal, published } = req.body;

      const file = filename;

      const deleteFile = () => {
        const filePath = path.join(process.cwd(), "uploads", "videos", file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      };

      // jika user suoeradmin atau admin bisa mengubah semua dokumen
      if (role === "admin" || role === "superadmin") {
        // hapus file sebelumnya dalam storage
        const cek_videos = await prisma.photos.findFirst({
          where: { id_photos: parseInt(id) },
        });

        if (!cek_videos) {
          deleteFile();
          return {
            status_code: 404,
            status: false,
            message: "Video not found",
          };
        }

        if (file) {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "videos",
            cek_videos.file
          );

          // Cek apakah file ada sebelum dihapus
          fs.unlinkSync(filePath);
        }

        const videos = await prisma.videos.update({
          where: { id_videos: parseInt(id) },
          data: {
            judul: judul,
            untuk: untuk,
            deskripsi: deskripsi,
            tanggal: tanggal,
            published: published,
            bidang: bidang,
            file: file,
          },
        });

        return {
          status_code: 200,
          status: true,
          message: "Videos updated",
        };
      }

      // hapus file sebelumnya dalam storage
      const cek_videos = await prisma.videos.findFirst({
        where: { id_videos: parseInt(id) }, // pastikan 'id' sudah diambil dari request atau sumber lain
      });

      if (!cek_videos) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Photo not found",
        };
      }

      // jika document authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_videos && cek_videos.authorId !== user_id) {
        deleteFile();
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      if (file) {
        // Hapus file sebelumnya
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "videos",
          cek_videos.file
        );

        // Cek apakah file ada sebelum dihapus
        fs.unlinkSync(filePath);
      }

      const videos = await prisma.videos.update({
        where: { id_videos: parseInt(id) },
        data: {
          judul: judul,
          untuk: untuk,
          deskripsi: deskripsi,
          tanggal: tanggal,
          published: published,
          bidang: bidang,
          file: file,
        },
      });

      return {
        status_code: 200,
        status: true,
        message: "Video updated",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async DeleteVideos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { id } = req.params;

      // cek videos authorId
      const cek_videos = await prisma.videos.findFirst({
        where: { id_videos: parseInt(id) },
      });

      if (!cek_videos) {
        return {
          status_code: 404,
          status: false,
          message: "Video not found",
        };
      }
      const file = cek_videos?.file;

      // jika role admin atau superadmin
      if (role === "admin" || role === "superadmin") {
        const videos = await prisma.videos.delete({
          where: { id_videos: parseInt(id) },
        });
        if (!videos) {
          return {
            status_code: 404,
            status: false,
            message: "videos not found",
          };
        }

        const filePath = path.join(process.cwd(), "uploads", "videos", file);
        fs.unlink(filePath, (err) => {
          if (err) {
            return {
              status_code: 500,
              status: false,
              message: err.message,
            };
          }
        });
        return {
          status_code: 200,
          status: true,
          message: "video deleted",
        };
      }

      // jika videos authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_videos && cek_videos.authorId !== user_id) {
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      await prisma.videos.delete({
        where: { id_videos: parseInt(id) },
      });

      const filePath = path.join(process.cwd(), "uploads", "videos", file);
      fs.unlink(filePath, (err) => {
        if (err) {
          return {
            status_code: 500,
            status: false,
            message: err.message,
          };
        }
      });

      return {
        status_code: 200,
        status: true,
        message: "Video deleted",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },
};
