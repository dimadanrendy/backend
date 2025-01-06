import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/pegawai");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};
const uploadFotoPegawai = multer({
  storage: storage,
  fileFilter: fileFilter,
  // limits: {
  //     fileSize: 3 * 1000 * 1000 // 3 MB
  // }
});

export default uploadFotoPegawai;
