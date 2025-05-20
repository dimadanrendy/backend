import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { startOfDay, endOfDay } from "date-fns";

dotenv.config();

const prisma = new PrismaClient();

async function generateNoPelaporan() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // e.g. 20250519
  // Hitung berapa sudah ada no_pelaporan hari ini
  const countToday = await prisma.pengaduan.count({
    where: {
      no_pelaporan: {
        startsWith: `PEL-${datePart}`,
      },
    },
  });

  const newNumber = (countToday + 1).toString().padStart(4, "0"); // 001, 002, dst.
  const randomPart = Math.floor(100 + Math.random() * 900); // 100 - 999
  return `PEL-${datePart}-${newNumber}-${randomPart}`;
}

export const PengaduanService = {
  async GetStatusPengaduan(req) {
    try {
      const { no_pengaduan } = req.params;

      const pengaduan = await prisma.pengaduan.findUnique({
        where: {
          no_pelaporan: no_pengaduan,
        },
        include: {
          balasan: true,
        },
      });

      if (!pengaduan) {
        return {
          status_code: 404,
          status: false,
          message: "Laporan tidak ditemukan",
        };
      }
      let statusMessage = "";
      switch (pengaduan.status) {
        case 1:
          statusMessage = "Laporan terkirim";
          break;
        case 2:
          statusMessage = "Laporan diproses";
          break;
        case 3:
          statusMessage = "Laporan ditanggapi";
          break;
        default:
          statusMessage = "Status laporan tidak diketahui";
      }

      return {
        status_code: 200,
        status: true,
        message: statusMessage,

        balasan: pengaduan.balasan || "Belum ada balasan",
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

  async GetAllPengaduan(req) {
    // jika role admin yang bisa melihat semua pengaduan
    const { id: user_id, role } = req.user; // Ambil user_id dan role
    if (role === "admin" || role === "superadmin") {
      try {
        const pengaduan = await prisma.pengaduan.findMany();
        return {
          status_code: 200,
          status: true,
          message: "Semua Pengaduan",
          data: pengaduan,
        };
      } catch (error) {
        return {
          status_code: 500,
          status: false,
          message: "Internal server error",
          message_error: error.message,
        };
      }
    }
  },

  async PostPengaduan(data) {
    try {
      const { filename } = data.file;
      const dataPengaduan = data.body;
      const published = true;
      const file = filename;
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);

      const existingPengaduan = await prisma.pengaduan.findFirst({
        where: {
          email: dataPengaduan.email,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      if (existingPengaduan) {
        return {
          status_code: 400,
          status: false,
          message: "Pengaduan dengan email tersebut sudah ada pada hari ini",
        };
      }

      const no_pelaporan = await generateNoPelaporan();

      const photos = await prisma.pengaduan.create({
        data: {
          no_pelaporan,
          email: dataPengaduan.email,
          lingkuppengaduan: dataPengaduan.lingkuppengaduan,
          areapengaduan: dataPengaduan.areapengaduan,
          namaterlapor: dataPengaduan.namaterlapor,
          lokasikejadian: dataPengaduan.lokasikejadian,
          tanggalkejadian: dataPengaduan.tanggalkejadian,
          waktukejadian: dataPengaduan.waktukejadian,
          uraianpengaduan: dataPengaduan.uraianpengaduan,
          lampiran: filename ?? "",
          status: dataPengaduan.status ?? 1,
          pernyataan: dataPengaduan.pernyataan === "true" ? true : false,
        },
      });
      return {
        status_code: 201,
        status: true,
        message: "Pengaduan Telah Terkirim",
        no_pelaporan: no_pelaporan,
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async GetPengaduanById(req) {
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

  async PatchPengaduan(req) {
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

  async DeletePengaduan(req) {
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
};
