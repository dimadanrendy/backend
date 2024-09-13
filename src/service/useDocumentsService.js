import { AuthService } from "./useAuthService.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DocumentsService = {
  async GetDocuments(req) {
    try {
      const user_id = req.headers["x-session-user"];

      // cek session user
      const session = await AuthService.GetSessionById(user_id);
      if (session.status === false) {
        return session;
      }

      // cek role user apakah admin jika admin atau super admin tampilkan semua dokumen
      if (session.user.role === "admin" || session.user.role === "superadmin") {
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
        where: { authorId: session.user.id },
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
      const user_id = req.headers["x-session-user"];
      const { id } = req.params;

      // cek session user
      const session = await AuthService.GetSessionById(user_id);
      if (session.status === false) {
        return session;
      }
      // cek role user apakah admin jika admin atau super admin tampilkan dokumen berdasarkan id
      if (session.user.role === "admin" || session.user.role === "superadmin") {
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
        where: { id_documents: parseInt(id), authorId: session.user.id },
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
      const user_id = data.headers["x-session-user"];
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
};
