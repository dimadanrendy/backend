import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export const FronendService = {
  async GetPhotosById(req) {
    try {
      const { id } = req.params; // Ambil id dari parameter

      // Query data berdasarkan id
      const photo = await prisma.photos.findUnique({
        where: { id_photos: parseInt(id) },
      });

      // Cek apakah data ditemukan
      if (!photo) {
        return {
          status_code: 404,
          status: false,
          message: "Photo not found",
        };
      }

      // Tambahkan URL lengkap untuk file
      const photoWithUrl = {
        ...photo,
        photoUrl: `${process.env.ENDPOINT_URL}/api/v1/file/photos/${photo.file}`,
      };

      // Return data dengan status sukses
      return {
        status_code: 200,
        status: true,
        data: photoWithUrl,
      };
    } catch (error) {
      // Tangani error jika terjadi kesalahan server
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
      const { tipe, bidang } = req.params; // Ambil parameter tipe dan bidang
      const { page = 1, pageSize = 10 } = req.query; // Ambil parameter pagination

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

      // Hitung total data untuk pagination
      const totalCount = await prisma.photos.count({
        where: whereCondition,
      });

      // Hitung data dengan pagination
      const photos = await prisma.photos.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(pageSize), // Hitung jumlah data yang dilewatkan
        take: Number(pageSize), // Ambil data sesuai jumlah pageSize
      });

      // Jika tidak ada data yang ditemukan
      if (!photos || photos.length === 0) {
        return {
          status_code: 404,
          status: false,
          message: "Photos not found",
        };
      }

      const photosWithUrl = photos.map((photo) => ({
        ...photo,
        photoUrl: `${process.env.ENDPOINT_URL}/access/file/photos/${photo.file}`,
      }));

      // Jika sukses
      return {
        status_code: 200,
        status: true,
        data: photosWithUrl,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / Number(pageSize)),
        },
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

  async GetPegawaiByQuery(req) {
    try {
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

      // Query ke database
      const photos = await prisma.pegawai.findMany({
        where: whereCondition,
        orderBy: { createdAt: "asc" },
      });

      // Jika tidak ada data yang ditemukan
      if (!photos || photos.length === 0) {
        return {
          status_code: 404,
          status: false,
          message: "Data pegawai not found",
        };
      }

      const photosWithUrl = photos.map((photo) => ({
        ...photo,
        photoUrl: `${process.env.ENDPOINT_URL}/access/file/pegawai/${photo.image}`,
      }));

      // Jika sukses
      return {
        status_code: 200,
        status: true,
        data: photosWithUrl,
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

  async GetDokumentsByQuery(req) {
    try {
      const { tipe_dokumen, tahun, id } = req.params; // Ambil parameter status dan bidang

      // Variabel untuk filter query
      let tahun_query = undefined;
      let tipe_dokumen_query = "";
      let id_query = undefined;

      // Cek status
      if (tipe_dokumen === "lainnya") {
        tipe_dokumen_query = "lainnya";
      } else if (tipe_dokumen === "perwako") {
        tipe_dokumen_query = "perwako";
      } else if (tipe_dokumen === "perda") {
        tipe_dokumen_query = "perda";
      } else if (tipe_dokumen === "sk") {
        tipe_dokumen_query = "sk";
      } else {
        return {
          status_code: 400,
          status: false,
          message: "Invalid status",
        };
      }

      // Cek tahun
      if (tahun) {
        tahun_query = tahun; // Gunakan tahun jika ada
      }

      // Cek id dokumen
      if (id) {
        id_query = id; // Gunakan id jika ada
      }

      // Filter query untuk Prisma
      const whereCondition = {
        ...(tahun_query && { tahun: tahun_query }),
        tipe_dokumen: tipe_dokumen_query,
        ...(id_query && { id_documents: id_query }),
        published: true,
      };

      // Query ke database
      const document = await prisma.documents.findMany({
        where: whereCondition,
        orderBy: { createdAt: "asc" },
      });

      // Jika tidak ada data yang ditemukan
      if (!document || document.length === 0) {
        return {
          status_code: 404,
          status: false,
          message: "Data dokumen not found",
        };
      }

      const documentWithUrl = document.map((document) => ({
        ...document,
        documentUrl: `${process.env.ENDPOINT_URL}/access/file/documents/${document.file}`,
        fileType: document.file.split(".").pop(),
      }));

      // Jika sukses
      return {
        status_code: 200,
        status: true,
        data: documentWithUrl,
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
