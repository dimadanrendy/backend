import { DocumentsService } from "../service/useDocumentsService.js";

export const GetDocuments = async (req, res) => {
  const documents = await DocumentsService.GetDocuments();
  return res.status(documents.status_code).json(documents);
};

export const PostDocuments = async (req, res) => {
  const documents = await DocumentsService.PostDocuments(req);
  if (!documents) {
    return res.status(documents.status_code).json({
      status_code: documents.status_code,
      status: documents.status,
      message: documents.message,
    });
  }

  return res.status(documents.status_code).json(documents);
};

export const PatchDocuments = async (req, res) => {
  res.send("Hello World!");
};

export const DeleteDocuments = async (req, res) => {
  res.send("Hello World!");
};

export const GetDocumentsById = async (req, res) => {
  res.send("Hello World!");
};
