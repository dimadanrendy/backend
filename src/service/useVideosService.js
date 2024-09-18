import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const VidoesService = {
  async GetVidoes(req) {
    try {
      const user_id = req.headers["x-session-user"];

      // cek session user
      const session = await AuthService.GetSessionAuth(user_id);
      if (session.status === false) {
        return session;
      }

      // cek role user apakah admin jika admin atau super admin tampilkan semua dokumen
      if (session.user.role === "admin" || session.user.role === "superadmin") {
        const videos = await prisma.videos.findMany();

        if (!videos) {
          return {
            status_code: 404,
            status: false,
            message: "Videos not found",
          };
        }
        return {
          status_code: 200,
          status: true,
          data: videos,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const videos = await prisma.videos.findMany({
        where: { authorId: session.user.id },
      });

      if (!videos) {
        return {
          status_code: 404,
          status: false,
          message: "Videos not found",
        };
      }

      return {
        status_code: 200,
        status: true,
        data: videos,
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
      const user_id = req.headers["x-session-user"];
      const { id } = req.params;

      // cek session user
      const session = await AuthService.GetSessionAuth(user_id);
      if (session.status === false) {
        return session;
      }
      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (session.user.role === "admin" || session.user.role === "superadmin") {
        const videos = await prisma.videos.findUnique({
          where: { id_videos: parseInt(id) },
        });

        if (!videos) {
          return {
            status_code: 404,
            status: false,
            message: "Document not found",
          };
        }
        return {
          status_code: 200,
          status: true,
          data: videos,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const videos = await prisma.videos.findUnique({
        where: { id_videos: parseInt(id), authorId: session.user.id },
      });

      if (!videos) {
        return {
          status_code: 404,
          status: false,
          message: "Document not found",
        };
      }
      return {
        status_code: 200,
        status: true,
        data: videos,
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
      const user_id = data.headers["x-session-user"];
      const { filename } = data.file;
      const { judul, huruf_besar, deskripsi, bidang, tanggal } = data.body;

      if (user_id === undefined || user_id === null) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      const session = await prisma.session.findFirst({
        where: { authorId: user_id },
      });

      if (!session) {
        return {
          status_code: 404,
          status: false,
          message: "Session not found",
        };
      }
      const published = true;
      const file = filename;
      const authorId = session.authorId;
      const authorUsername = session.username;

      const videos = await prisma.videos.create({
        data: {
          judul: judul,
          huruf_besar: huruf_besar,
          tanggal: tanggal,
          bidang: bidang,
          deskripsi: deskripsi,
          published: published,
          file: file,
          authorId: authorId,
          authorUsername: authorUsername,
        },
      });
      return {
        status_code: 201,
        status: true,
        message: "Videos created",
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
      const user_id = req.headers["x-session-user"];
      const { id } = req.params;
      const { filename } = req.file;
      const { judul, huruf_besar, deskripsi, bidang, tanggal, published } =
        req.body;

      const file = filename;

      const deleteFile = () => {
        const filePath = path.join(process.cwd(), "public", "videos", file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      };

      if (user_id === undefined || user_id === null) {
        deleteFile();
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      if (!file) {
        deleteFile();
        return {
          status_code: 400,
          status: false,
          message: "File not found",
        };
      }

      const session = await prisma.session.findFirst({
        where: { authorId: user_id },
      });

      if (!session) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Session not found",
        };
      }

      // jika user suoeradmin atau admin bisa mengubah semua dokumen
      if (session.role === "admin" || session.role === "superadmin") {
        // hapus file sebelumnya dalam storage
        const cek_videos = await prisma.videos.findFirst({
          where: { id_videos: parseInt(id) },
        });

        if (cek_videos && cek_videos.file) {
          try {
            // Hapus file sebelumnya
            const filePath = path.join(
              process.cwd(),
              "public",
              "videos",
              cek_videos.file
            );

            // Cek apakah file ada sebelum dihapus
            fs.unlinkSync(filePath); // Menghapus file
          } catch (err) {
            return {
              status_code: 500,
              status: false,
              message: err.message,
            };
          }
        }

        const videos = await prisma.videos.update({
          where: { id_videos: parseInt(id) },
          data: {
            judul: judul,
            huruf_besar: huruf_besar,
            deskripsi: deskripsi,
            tanggal: tanggal,
            published: published,
            bidang: bidang,
            file: file,
          },
        });
        if (!videos) {
          deleteFile();
          return {
            status_code: 404,
            status: false,
            message: "Videos not found",
          };
        }

        return {
          status_code: 200,
          status: true,
          message: "Videos updated",
        };
      }

      // Jika authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (session.authorId !== user_id) {
        deleteFile();
        return {
          status_code: 403,
          status: false,
          message: "Unauthorized",
        };
      }

      // hapus file sebelumnya dalam storage
      const cek_videos = await prisma.videos.findFirst({
        where: { id_videos: parseInt(id) }, // pastikan 'id' sudah diambil dari request atau sumber lain
      });

      // jika document authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_videos && cek_videos.authorId !== user_id) {
        deleteFile();
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      if (!cek_videos) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Videos not found",
        };
      }

      if (cek_videos && cek_videos.file) {
        try {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "public",
            "videos",
            cek_videos.file
          );

          // Cek apakah file ada sebelum dihapus
          fs.unlinkSync(filePath); // Menghapus file
        } catch (err) {
          return {
            status_code: 500,
            status: false,
            message: err.message,
          };
        }
      }

      const videos = await prisma.videos.update({
        where: { id_videos: parseInt(id) },
        data: {
          judul: judul,
          huruf_besar: huruf_besar,
          deskripsi: deskripsi,
          tanggal: tanggal,
          published: published,
          bidang: bidang,
          file: file,
        },
      });
      if (!videos) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Videos not found",
        };
      }

      return {
        status_code: 200,
        status: true,
        message: "Videos updated",
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
      const user_id = req.headers["x-session-user"];
      const { id } = req.params;
      const session = await prisma.session.findFirst({
        where: { authorId: user_id },
      });

      if (!session) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      // cek videos authorId
      const cek_videos = await prisma.videos.findFirst({
        where: { id_videos: parseInt(id) },
      });

      if (!cek_videos) {
        return {
          status_code: 404,
          status: false,
          message: "Videos not found",
        };
      }
      const file = cek_videos?.file;

      // jika role admin atau superadmin
      if (session.role === "admin" || session.role === "superadmin") {
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

        const filePath = path.join(process.cwd(), "public", "videos", file);
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
          message: "videos deleted",
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

      const filePath = path.join(process.cwd(), "public", "videos", file);
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
        message: "Videos deleted",
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
