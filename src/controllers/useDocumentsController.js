import { DocumentsService } from "../service/useDocumentsService.js";

export const GetDocuments = async (req, res) => {
  try {
    const documents = await DocumentsService.GetDocuments(req);
    if (documents.status === false) {
      return res.status(documents.status_code).json(documents);
    }
    return res.status(documents.status_code).json(documents);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
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
  const documents = await DocumentsService.PatchDocuments(req);
  if (!documents) {
    return res.status(documents.status_code).json({
      status_code: documents.status_code,
      status: documents.status,
      message: documents.message,
    });
  }
  return res.status(documents.status_code).json(documents);
};

export const DeleteDocuments = async (req, res) => {
  const documents = await DocumentsService.DeleteDocuments(req);
  if (!documents) {
    return res.status(documents.status_code).json({
      status_code: documents.status_code,
      status: documents.status,
      message: documents.message,
    });
  }
  return res.status(documents.status_code).json(documents);
};

export const GetDocumentsById = async (req, res) => {
  try {
    const documents = await DocumentsService.GetDocumentsById(req);
    if (documents.status === false) {
      return res.status(documents.status_code).json(documents);
    }
    return res.status(documents.status_code).json(documents);
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      status: false,
      message: "Internal server error",
      message_error: error.message,
    });
  }
};
