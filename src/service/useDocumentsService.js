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

  async PostDocuments(data) {
    try {
      const { id: user_id, role, username, email } = data.user;
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
      const { id } = req.params;
      const { filename } = req.file;
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
        published,
      } = req.body;

      const file = filename;

      const deleteFile = () => {
        const filePath = path.join(process.cwd(), "uploads", "documents", file);
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
        const cek_documents = await prisma.documents.findFirst({
          where: { id_documents: parseInt(id) },
        });

        if (cek_documents && cek_documents.file) {
          try {
            // Hapus file sebelumnya
            const filePath = path.join(
              process.cwd(),
              "uploads",
              "documents",
              cek_documents.file
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
            published: published,
            file: file,
          },
        });
        if (!documents) {
          deleteFile();
          return {
            status_code: 404,
            status: false,
            message: "Documents not found",
          };
        }

        return {
          status_code: 200,
          status: true,
          message: "Documents updated",
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
      const cek_documents = await prisma.documents.findFirst({
        where: { id_documents: parseInt(id) }, // pastikan 'id' sudah diambil dari request atau sumber lain
      });

      // jika document authorId tidak sama dengan user_id, maka hanya boleh mengubah dokumen miliknya
      if (cek_documents && cek_documents.authorId !== user_id) {
        deleteFile();
        return {
          status_code: 403,
          status: false,
          message: "Access denied",
        };
      }

      if (!cek_documents) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Documents not found",
        };
      }

      if (cek_documents && cek_documents.file) {
        try {
          // Hapus file sebelumnya
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "documents",
            cek_documents.file
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
          published: published,
          file: file,
        },
      });
      if (!documents) {
        deleteFile();
        return {
          status_code: 404,
          status: false,
          message: "Documents not found",
        };
      }

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
      if (session.role === "admin" || session.role === "superadmin") {
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
