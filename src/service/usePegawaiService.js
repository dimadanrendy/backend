// import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const PegawaiService = {
  async GetPhotos(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      // cek role user apakah admin jika admin atau super admin tampilkan semua dokumen
      if (role === "admin" || role === "superadmin") {
        const photos = await prisma.pegawai.findMany();

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
      const photos = await prisma.pegawai.findMany({
        where: { authorId: user_id },
      });

      if (!photos) {
        return {
          status_code: 404,
          status: false,
          message: "photos not found",
        };
      }

      photosWithUrls = photos.map((photo) => ({
        ...photo,
        photoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/pegawai/${photo.pegawai}`,
      }));

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

      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (role === "admin" || role === "superadmin") {
        const photos = await prisma.pegawai.findUnique({
          where: { id_pegawai: parseInt(id) },
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
      const photos = await prisma.pegawai.findUnique({
        where: { id_pegawai: parseInt(id), authorId: user_id },
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

  async GetPhotosByQuery(req) {
    try {
      const { id: user_id, role } = req.user; // Ambil user_id dan role
      const { status, bidang } = req.params; // Ambil parameter status dan bidang

      // Variabel untuk filter query
      let status_query = "";
      let bidang_query = undefined; // Default bidang kosong (tidak difilter)

      // Cek status
      if (status === "pejabat-eselon") {
        status_query = "Pejabat Eselon";
      } else if (status === "phl") {
        status_query = "PHL";
      } else if (status === "pns") {
        status_query = "PNS";
      } else if (status === "pppk") {
        status_query = "PPPK";
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
        status: status_query,
        ...(bidang_query && { bidang: bidang_query }), // Tambahkan bidang jika ada
      };

      // Jika role bukan admin atau superadmin, filter data berdasarkan authorId
      if (role !== "admin" && role !== "superadmin") {
        whereCondition.authorId = user_id; // Hanya data milik user tersebut
      }

      // Query ke database
      const photos = await prisma.pegawai.findMany({
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

  async PostPhotos(data) {
    try {
      console.log(data.user);
      console.log(data.file);
      const { id: user_id, role, username } = data.user;
      const { filename } = data.file;
      const {
        name,
        jabatan,
        golongan,
        bidang,
        nip,
        pendidikan_terahir,
        email,
        status,
      } = data.body;

      const published = true;
      const image = filename;
      const authorId = user_id;
      const authorUsername = username;

      const photos = await prisma.pegawai.create({
        data: {
          name: name,
          jabatan: jabatan,
          golongan: golongan,
          bidang: bidang,
          nip: nip,
          pendidikan_terahir: pendidikan_terahir,
          email: email,
          status: status,
          published: published,
          image: image,
          authorId: authorId,
          authorUsername: authorUsername,
        },
      });

      console.log(photos);
      return {
        status_code: 201,
        status: true,
        message: "Pegawai Created",
      };
    } catch (error) {
      console.log(error);
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async PatchPhotos(req) {
    try {
      const { id: user_id, role, username } = req.user;
      const { id } = req.params;
      const { filename } = req.file;
      const {
        name,
        jabatan,
        golongan,
        bidang,
        nip,
        pendidikan_terahir,
        email,
        published,
      } = req.body;

      const image = filename;
      const publish = published === "true" ? true : false;

      const deleteFile = () => {
        if (image) {
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "pegawai",
            image
          );
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        } else {
          return;
        }
      };

      // jika user suoeradmin atau admin bisa mengubah semua dokumen
      if (role === "admin" || role === "superadmin") {
        const photos = await prisma.pegawai.findFirst({
          where: { id_pegawai: parseInt(id) },
        });

        if (!photos) {
          deleteFile();
          return {
            status_code: 404,
            status: false,
            message: "Pegawai not found",
          };
        }

        if (photos && photos.image) {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "pegawai",
            photos.image
          );

          // Cek apakah file ada sebelum dihapus
          fs.unlinkSync(filePath);
        }

        const documents = await prisma.pegawai.update({
          where: { id_pegawai: parseInt(id) },
          data: {
            name: name,
            jabatan: jabatan,
            golongan: golongan,
            bidang: bidang,
            nip: nip,
            pendidikan_terahir: pendidikan_terahir,
            email: email,
            published: publish,
            image: image,
          },
        });

        return {
          status_code: 200,
          status: true,
          message: "Documents updated",
        };
      }

      // hapus file sebelumnya dalam storage
      const cek_photos = await prisma.pegawai.findFirst({
        where: { id_pegawai: parseInt(id) },
      });

      if (!cek_photos) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Pegawai not found",
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

      if (image !== null) {
        try {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "documents",
            cek_photos.image
          );

          // Cek apakah file ada sebelum dihapus
          fs.unlinkSync(filePath);
        } catch (err) {
          return {
            status_code: 500,
            status: false,
            message: err.message,
          };
        }
      } else {
        image = cek_photos.image;
      }

      const documents = await prisma.pegawai.update({
        where: { id_pegawai: parseInt(id) },
        data: {
          name: name,
          jabatan: jabatan,
          golongan: golongan,
          bidang: bidang,
          nip: nip,
          pendidikan_terahir: pendidikan_terahir,
          email: email,
          published: publish,
          image: image,
        },
      });

      return {
        status_code: 200,
        status: true,
        message: "Pegawai updated",
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

      // cek documents authorId
      const cek_photos = await prisma.pegawai.findFirst({
        where: { id_pegawai: parseInt(id) },
      });

      if (!cek_photos) {
        return {
          status_code: 404,
          status: false,
          message: "Pegawai not found",
        };
      }
      const image = cek_photos?.image;

      // jika role admin atau superadmin
      if (role === "admin" || role === "superadmin") {
        const documents = await prisma.pegawai.delete({
          where: { id_pegawai: parseInt(id) },
        });
        if (!documents) {
          return {
            status_code: 404,
            status: false,
            message: "Documents not found",
          };
        }

        const filePath = path.join(process.cwd(), "uploads", "pegawai", image);
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
          message: "Pegawai deleted",
        };
      }

      // jika documents authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_photos && cek_photos.authorId !== user_id) {
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      await prisma.pegawai.delete({
        where: { id_pegawai: parseInt(id) },
      });

      const filePath = path.join(process.cwd(), "uploads", "pegawai", image);
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
        message: "Pegawai deleted",
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
