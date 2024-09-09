import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DocumentsService = {
  async GetDocuments() {
    const documents = await prisma.documents.findMany();
    return documents;
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
      } = data;

      const published = true;
      const file = null;
      const authorId = 1;

      const documents = await prisma.documents.create({
        data: {
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
          file,
          authorId,
        },
      });
      return documents;
    } catch (error) {}
  },
};
