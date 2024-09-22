import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const PhotosService = {
  async GetPhotos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;

      // cek session user
      const session = await AuthService.GetSessionAuth(user_id);
      if (session.status === false) {
        return session;
      }

      // cek role user apakah admin jika admin atau super admin tampilkan semua dokumen
      if (session.user.role === "admin" || session.user.role === "superadmin") {
        const photos = await prisma.photos.findMany();

        if (!photos) {
          return {
            status_code: 404,
            status: false,
            message: "photos not found",
          };
        }
        return {
          status_code: 200,
          status: true,
          data: photos,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const photos = await prisma.photos.findMany({
        where: { authorId: session.user.id },
      });

      if (!photos) {
        return {
          status_code: 404,
          status: false,
          message: "photos not found",
        };
      }

      return {
        status_code: 200,
        status: true,
        data: photos,
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

  async GetPhotosById(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { id } = req.params;

      // cek session user
      const session = await AuthService.GetSessionAuth(user_id);
      if (session.status === false) {
        return session;
      }
      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (session.user.role === "admin" || session.user.role === "superadmin") {
        const photos = await prisma.photos.findUnique({
          where: { id_photos: parseInt(id) },
        });

        if (!photos) {
          return {
            status_code: 404,
            status: false,
            message: "Document not found",
          };
        }
        return {
          status_code: 200,
          status: true,
          data: photos,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const photos = await prisma.photos.findUnique({
        where: { id_photos: parseInt(id), authorId: session.user.id },
      });

      if (!photos) {
        return {
          status_code: 404,
          status: false,
          message: "Document not found",
        };
      }
      return {
        status_code: 200,
        status: true,
        data: photos,
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

  async PostPhotos(data) {
    try {
      const { id: user_id, role, username, email } = data.user;
      const { filename } = data.file;
      const { judul, huruf_besar, deskripsi, bidang, tanggal } = data.body;

      console.log(filename);

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

      const photos = await prisma.photos.create({
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
        message: "photos created",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async PatchPhotos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { id } = req.params;
      const { filename } = req.file;
      const { judul, huruf_besar, deskripsi, bidang, tanggal, published } =
        req.body;

      const file = filename;

      const deleteFile = () => {
        const filePath = path.join(process.cwd(), "public", "photos", file);
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
        const cek_photos = await prisma.photos.findFirst({
          where: { id_photos: parseInt(id) },
        });

        if (cek_photos && cek_photos.file) {
          try {
            // Hapus file sebelumnya
            const filePath = path.join(
              process.cwd(),
              "public",
              "photos",
              cek_photos.file
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

        const photos = await prisma.photos.update({
          where: { id_photos: parseInt(id) },
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
        if (!photos) {
          deleteFile();
          return {
            status_code: 404,
            status: false,
            message: "photos not found",
          };
        }

        return {
          status_code: 200,
          status: true,
          message: "photos updated",
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
      const cek_photos = await prisma.photos.findFirst({
        where: { id_photos: parseInt(id) }, // pastikan 'id' sudah diambil dari request atau sumber lain
      });

      // jika document authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_photos && cek_photos.authorId !== user_id) {
        deleteFile();
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      if (!cek_photos) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "photos not found",
        };
      }

      if (cek_photos && cek_photos.file) {
        try {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "public",
            "photos",
            cek_photos.file
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

      const photos = await prisma.photos.update({
        where: { id_photos: parseInt(id) },
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
      if (!photos) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "photos not found",
        };
      }

      return {
        status_code: 200,
        status: true,
        message: "photos updated",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async DeletePhotos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
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

      // cek photos authorId
      const cek_photos = await prisma.photos.findFirst({
        where: { id_photos: parseInt(id) },
      });

      if (!cek_photos) {
        return {
          status_code: 404,
          status: false,
          message: "photos not found",
        };
      }
      const file = cek_photos?.file;

      // jika role admin atau superadmin
      if (session.role === "admin" || session.role === "superadmin") {
        const photos = await prisma.photos.delete({
          where: { id_photos: parseInt(id) },
        });
        if (!photos) {
          return {
            status_code: 404,
            status: false,
            message: "photos not found",
          };
        }

        const filePath = path.join(process.cwd(), "public", "photos", file);
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
          message: "photos deleted",
        };
      }

      // jika photos authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_photos && cek_photos.authorId !== user_id) {
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      await prisma.photos.delete({
        where: { id_photos: parseInt(id) },
      });

      const filePath = path.join(process.cwd(), "public", "photos", file);
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
        message: "photos deleted",
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
