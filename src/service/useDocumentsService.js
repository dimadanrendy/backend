import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const DocumentsService = {
  async GetDocuments(req) {
    try {
      const { id, role, username, email } = req.user;

      // cek role user apakah admin jika admin atau super admin tampilkan semua dokumen
      if (role === "admin" || role === "superadmin") {
        const documents = await prisma.documents.findMany();

        if (!documents) {
          return {
            status_code: 404,
            status: false,
            message: "Documents not found",
          };
        }
        return {
          status_code: 200,
          status: true,
          data: documents,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const documents = await prisma.documents.findMany({
        where: { authorId: id },
      });

      if (!documents) {
        return {
          status_code: 404,
          status: false,
          message: "Documents not found",
        };
      }

      const documentsWithUrls = documents.map((document) => ({
        ...document,
        documentUrl: `${process.env.ENDPOINT_URL}/file/${document.file}`,
      }));

      return {
        status_code: 200,
        status: true,
        data: documentsWithUrls,
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

  async GetDocumentsById(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { id } = req.params;

      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (role === "admin" || role === "superadmin") {
        const documents = await prisma.documents.findUnique({
          where: { id_documents: parseInt(id) },
        });

        if (!documents) {
          return {
            status_code: 404,
            status: false,
            message: "Document not found",
          };
        }
        return {
          status_code: 200,
          status: true,
          data: documents,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const documents = await prisma.documents.findUnique({
        where: { id_documents: parseInt(id), authorId: user_id },
      });

      if (!documents) {
        return {
          status_code: 404,
          status: false,
          message: "Document not found",
        };
      }
      return {
        status_code: 200,
        status: true,
        data: documents,
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

  async GetDocumentsByQuery(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { tipe_dokumen, tahun, id } = req.params; // Ambil parameter status dan bidang
      console.log(req.params);

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
      } else if (tipe_dokumen === "surat-keputusan") {
        tipe_dokumen_query = "surat-keputusan";
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
      };

      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (role === "admin" || role === "superadmin") {
        const documents = await prisma.documents.findMany({
          where: whereCondition,
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!documents) {
          return {
            status_code: 404,
            status: false,
            message: "Document not found",
          };
        }

        const documentWithUrl = documents.map((document) => ({
          ...document,
          documentUrl: `${process.env.ENDPOINT_URL}/access/file/documents/${document.file}`,
        }));
        return {
          status_code: 200,
          status: true,
          data: documentWithUrl,
        };
      }

      // jika role user adalah user tampilkan sesuai authorId yang mereka upload
      const documents = await prisma.documents.findMany({
        where: { authorId: user_id, ...whereCondition },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!documents) {
        return {
          status_code: 404,
          status: false,
          message: "Document not found",
        };
      }

      const documentsWithUrls = documents.map((document) => ({
        ...document,
        documentUrl: `${process.env.ENDPOINT_URL}/access/file/documents/${document.file}`,
      }));
      return {
        status_code: 200,
        status: true,
        data: documentsWithUrls,
      };
    } catch (error) {
      console.log(error);
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
        message_error: error.message,
      };
    }
  },

  async PostDocuments(data) {
    try {
      const { id: user_id, role, name, username, email } = data.user;

      const { filename } = data.file;
      const {
        nomor,
        judul,
        tipe_dokumen,
        dokumen,
        bidang,
        singkatan,
        tahun,
        bahasa,
        tempat_penetapan,
        sumber,
        lokasi,
      } = data.body;

      if (user_id === undefined || user_id === null) {
        return {
          status_code: 401,
          status: false,
          message: "Unauthorized",
        };
      }

      const published = true;
      const file = filename;
      const authorId = user_id;
      const authorUsername = username;

      const documents = await prisma.documents.create({
        data: {
          nomor: nomor,
          judul: judul,
          tipe_dokumen: tipe_dokumen,
          dokumen: dokumen,
          bidang: bidang,
          singkatan: singkatan,
          tahun: tahun,
          bahasa: bahasa,
          tempat_penetapan: tempat_penetapan,
          sumber: sumber,
          lokasi: lokasi,
          published: published,
          file: file,
          authorId: authorId,
          authorUsername: authorUsername,
        },
      });
      return {
        status_code: 201,
        status: true,
        message: "Documents created",
      };
    } catch (error) {
      console.error(error.message);
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async PatchDocuments(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const filename = req.file;
      const {
        id,
        nomor,
        judul,
        tipe_dokumen,
        dokumen,
        bidang,
        singkatan,
        tahun,
        bahasa,
        tempat_penetapan,
        sumber,
        lokasi,
        published,
      } = req.body;

      const file = filename?.filename;

      const publish = published === "true" ? true : false;

      const deleteFile = () => {
        if (file) {
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "documents",
            file
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
        // hapus file sebelumnya dalam storage
        const cek_documents = await prisma.documents.findFirst({
          where: { id_documents: parseInt(id) },
        });

        if (!cek_documents) {
          deleteFile();
          return {
            status_code: 404,
            status: false,
            message: "Documents not found",
          };
        }

        if (file) {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "documents",
            cek_documents.file
          );

          // Cek apakah file ada sebelum dihapus
          fs.unlinkSync(filePath);
        }

        const documents = await prisma.documents.update({
          where: { id_documents: parseInt(id) },
          data: {
            nomor: nomor,
            judul: judul,
            tipe_dokumen: tipe_dokumen,
            dokumen: dokumen,
            bidang: bidang,
            singkatan: singkatan,
            tahun: tahun,
            bahasa: bahasa,
            tempat_penetapan: tempat_penetapan,
            sumber: sumber,
            lokasi: lokasi,
            published: publish,
            file: file,
          },
        });

        return {
          status_code: 200,
          status: true,
          message: "Documents updated",
        };
      }

      // hapus file sebelumnya dalam storage
      const cek_documents = await prisma.documents.findFirst({
        where: { id_documents: parseInt(id) },
      });

      if (!cek_documents) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Documents not found",
        };
      }

      // jika document authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_documents && cek_documents.authorId !== user_id) {
        deleteFile();
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      if (file !== null) {
        try {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "documents",
            cek_documents.file
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
        file = cek_documents.file;
      }

      const documents = await prisma.documents.update({
        where: { id_documents: parseInt(id) },
        data: {
          nomor: nomor,
          judul: judul,
          tipe_dokumen: tipe_dokumen,
          dokumen: dokumen,
          bidang: bidang,
          singkatan: singkatan,
          tahun: tahun,
          bahasa: bahasa,
          tempat_penetapan: tempat_penetapan,
          sumber: sumber,
          lokasi: lokasi,
          published: publish,
          file: file,
        },
      });

      return {
        status_code: 200,
        status: true,
        message: "Documents updated",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: error.message,
      };
    }
  },

  async DeleteDocuments(req) {
    try {
      const { id: user_id, role, username, email } = req.user;
      const { id } = req.params;

      // cek documents authorId
      const cek_documents = await prisma.documents.findFirst({
        where: { id_documents: parseInt(id) },
      });

      if (!cek_documents) {
        return {
          status_code: 404,
          status: false,
          message: "Documents not found",
        };
      }
      const file = cek_documents?.file;

      // jika role admin atau superadmin
      if (role === "admin" || role === "superadmin") {
        const documents = await prisma.documents.delete({
          where: { id_documents: parseInt(id) },
        });
        if (!documents) {
          return {
            status_code: 404,
            status: false,
            message: "Documents not found",
          };
        }

        const filePath = path.join(process.cwd(), "uploads", "documents", file);
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
          message: "Documents deleted",
        };
      }

      // jika documents authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_documents && cek_documents.authorId !== user_id) {
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      await prisma.documents.delete({
        where: { id_documents: parseInt(id) },
      });

      const filePath = path.join(process.cwd(), "uploads", "documents", file);
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
        message: "Documents deleted",
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
