export const GetDocuments = async (req, res) => {
  res.send("Hello World!");
};

export const PostDocuments = async (req, res) => {
  console.log(req.body);

  res.send("Masuk");
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
