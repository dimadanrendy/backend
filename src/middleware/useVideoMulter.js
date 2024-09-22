import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "video/mp4", // MIME type untuk file .mp4
    "video/x-msvideo", // MIME type untuk file .avi
    "video/quicktime", // MIME type untuk file .mov
    "video/x-matroska", // MIME type untuk file .mkv
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const uploadVideos = multer({
  storage: storage,
  fileFilter: fileFilter,
  // limits: {
  //     fileSize: 3 * 1000 * 1000 // 3 MB
  // }
});

export default uploadVideos;
