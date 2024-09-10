import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DocumentsService = {
  async GetDocuments() {
    const documents = await prisma.documents.findMany();
    return {
      status_code: 200,
      status: true,
      data: documents,
    };
  },

  async GetDocumentsById(id) {
    const document = await prisma.documents.findUnique({
      where: {
        id: id,
      },
    });
    return document;
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
