import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export const PhotosService = {
  async GetPhotos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;

      // cek role user apakah admin jika admin atau super admin tampilkan semua dokumen
      if (role === "admin" || role === "superadmin") {
        const photos = await prisma.photos.findMany();

        if (!photos) {
          return {
            status_code: 404,
            status: false,
            message: "photos not found",
          };
        }
        const photosWithUrls = photos.map((photo) => ({
          ...photo,
          photoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/photos/${photo.file}`,
        }));
        return {
          status_code: 200,
          status: true,
          data: photosWithUrls,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const photos = await prisma.photos.findMany({
        where: { authorId: user_id },
      });

      if (!photos) {
        return {
          status_code: 404,
          status: false,
          message: "photos not found",
        };
      }

      const photosWithUrls = photos.map((photo) => ({
        ...photo,
        photoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/photos/${photo.file}`,
      }));

      return {
        status_code: 200,
        status: true,
        data: photosWithUrls,
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
      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (role === "admin" || role === "superadmin") {
        const photos = await prisma.photos.findUnique({
          where: { id_photos: parseInt(id) },
        });

        if (!photos) {
          return {
            status_code: 404,
            status: false,
            message: "Photo not found",
          };
        }
        const photosWithUrls = photos.map((photo) => ({
          ...photo,
          photoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/photos/${photo.file}`,
        }));
        return {
          status_code: 200,
          status: true,
          data: photosWithUrls,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const photos = await prisma.photos.findUnique({
        where: { id_photos: parseInt(id), authorId: user_id },
      });

      if (!photos) {
        return {
          status_code: 404,
          status: false,
          message: "Photo not found",
        };
      }
      const photosWithUrls = photos.map((photo) => ({
        ...photo,
        photoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/photos/${photo.file}`,
      }));
      return {
        status_code: 200,
        status: true,
        data: photosWithUrls,
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
      const { judul, tipe, deskripsi, bidang, tanggal } = data.body;
      const published = true;
      const file = filename;

      const photos = await prisma.photos.create({
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
      const { judul, untuk, deskripsi, bidang, tanggal, published } = req.body;

      const file = filename;

      const deleteFile = () => {
        const filePath = path.join(process.cwd(), "uploads", "photos", file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      };

      // jika user suoeradmin atau admin bisa mengubah semua dokumen
      if (role === "admin" || role === "superadmin") {
        // hapus file sebelumnya dalam storage
        const cek_photos = await prisma.photos.findFirst({
          where: { id_photos: parseInt(id) },
        });

        if (!cek_photos) {
          deleteFile();
          return {
            status_code: 404,
            status: false,
            message: "Photo not found",
          };
        }

        if (file) {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "photos",
            cek_photos.file
          );

          // Cek apakah file ada sebelum dihapus
          fs.unlinkSync(filePath);
        }

        const photos = await prisma.photos.update({
          where: { id_photos: parseInt(id) },
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
          message: "Photo updated",
        };
      }

      // hapus file sebelumnya dalam storage
      const cek_photos = await prisma.photos.findFirst({
        where: { id_photos: parseInt(id) }, // pastikan 'id' sudah diambil dari request atau sumber lain
      });

      if (!cek_photos) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Photo not found",
        };
      }

      // jika document authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_photos && cek_photos.authorId !== user_id) {
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
          "photos",
          cek_photos.file
        );

        // Cek apakah file ada sebelum dihapus
        fs.unlinkSync(filePath);
      }

      const photos = await prisma.photos.update({
        where: { id_photos: parseInt(id) },
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
        message: "Photo updated",
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

      // cek photos authorId
      const cek_photos = await prisma.photos.findFirst({
        where: { id_photos: parseInt(id) },
      });

      if (!cek_photos) {
        return {
          status_code: 404,
          status: false,
          message: "Photo not found",
        };
      }
      const file = cek_photos?.file;

      // jika role admin atau superadmin
      if (role === "admin" || role === "superadmin") {
        const photos = await prisma.photos.delete({
          where: { id_photos: parseInt(id) },
        });
        if (!photos) {
          return {
            status_code: 404,
            status: false,
            message: "Photo not found",
          };
        }

        const filePath = path.join(process.cwd(), "uploads", "photos", file);
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
          message: "Photo deleted",
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

      const filePath = path.join(process.cwd(), "uploads", "photos", file);
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
        message: "Photo deleted",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async GetPhotosByQueryBerita(req) {
    try {
      const { id: user_id, role } = req.user; // Ambil user_id dan role
      const { tipe, bidang } = req.params; // Ambil parameter tipe dan bidang

      // Variabel untuk filter query
      let tipe_query = "";
      let bidang_query = undefined; // Default bidang kosong (tidak difilter)

      // Cek tipe
      if (tipe === "slider") {
        tipe_query = "Slider";
      } else if (tipe === "berita-foto") {
        tipe_query = "Berita Foto";
      } else if (tipe === "berita-video") {
        tipe_query = "Berita Video";
      } else if (tipe === "kegiatan") {
        tipe_query = "Kegiatan";
      } else if (tipe === "sekilas-info") {
        tipe_query = "Sekilas Info";
      } else if (tipe === "banner") {
        tipe_query = "Banner";
      } else if (tipe === "seputar-informasi") {
        tipe_query = "Seputar Informasi";
      } else {
        return {
          status_code: 400,
          status: false,
          message: "Invalid status",
        };
      }

      // Cek bidang (hanya tambahkan filter jika bidang diisi)
      if (bidang) {
        bidang_query = bidang; // Gunakan bidang jika ada
      }

      // Filter query untuk Prisma
      const whereCondition = {
        tipe: tipe_query, // Filter berdasarkan tipe
        ...(bidang_query && { bidang: bidang_query }), // Tambahkan bidang jika ada
      };

      // Jika role bukan admin atau superadmin, filter data berdasarkan authorId
      if (role !== "admin" && role !== "superadmin") {
        whereCondition.authorId = user_id; // Hanya data milik user tersebut
      }

      // Query ke database
      const photos = await prisma.photos.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
      });

      // Jika tidak ada data yang ditemukan
      if (!photos || photos.length === 0) {
        return {
          status_code: 404,
          status: false,
          message: "Document not found",
        };
      }

      // Jika sukses
      return {
        status_code: 200,
        status: true,
        data: photos,
      };
    } catch (error) {
      // Tangani error server
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
        message_error: error.message,
      };
    }
  },
};
