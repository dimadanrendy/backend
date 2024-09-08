import { body, validationResult } from "express-validator";

// Middleware untuk validasi user dengan konfirmasi password
export const validateUser = [
  body("email")
    .isEmail()
    .withMessage("Email must be valid")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email is required"),

  body("name")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username is required"),

  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters")
    .isLength({ max: 20 })
    .withMessage("Password must be at most 20 characters")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain at least one letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password is required"),

  body("confirmPassword")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  body("role")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Role is required")
    .custom((value) => {
      if (value !== "admin" && value !== "user" && value !== "superadmin") {
        throw new Error("Invalid role");
      }
      return true;
    }),

  body("bidang").trim().escape().notEmpty().withMessage("Bidang is required"),

  body("status")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Status is required")
    .toBoolean(), // Mengubah status menjadi boolean

  // Cek hasil validasi dan kirim error jika ada
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Lanjutkan ke handler berikutnya jika tidak ada error
  },
];

export const validateDocuments = [
  body("nomor").trim().escape().notEmpty().withMessage("Nomor is required"),

  body("judul").trim().escape().notEmpty().withMessage("Judul is required"),

  body("tipe_dokumen")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Tipe dokumen is required"),

  body("dokumen").trim().escape().notEmpty().withMessage("Dokumen is required"),

  body("bidang").trim().escape().notEmpty().withMessage("Bidang is required"),

  body("singkatan")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Singkatan is required"),

  body("tahun").trim().escape().notEmpty().withMessage("Tahun is required"),

  body("bahasa").trim().escape().notEmpty().withMessage("Bahasa is required"),

  body("tempat_penetapan")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Tempat penetapan is required"),

  body("sumber").trim().escape().notEmpty().withMessage("Sumber is required"),

  body("lokasi").trim().escape().notEmpty().withMessage("lokasi is required"),

  body("published")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Published is required"),

  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("File is required");
    }
    return true;
  }),

  // Cek hasil validasi dan kirim error jika ada
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Lanjutkan ke handler berikutnya jika tidak ada error
  },
];

export const validatePhotos = [
  body("judul").trim().escape().notEmpty().withMessage("Judul is required"),

  body("huruf_besar")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Huruf besar is required"),

  body("deskripsi")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Deskripsi is required"),

  body("bidang").trim().escape().notEmpty().withMessage("Bidang is required"),

  body("tanggal").trim().escape().notEmpty().withMessage("Tanggal is required"),

  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("File is required");
    }
    return true;
  }),

  // Cek 🙂 validasi dan kirim error jika ada
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Lanjutkan ke handler berikutnya jika tidak ada error
  },
];

export const validateVideos = [
  body("judul").trim().escape().notEmpty().withMessage("Judul is required"),

  body("huruf_besar")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Huruf besar is required"),

  body("deskripsi")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Deskripsi is required"),

  body("bidang").trim().escape().notEmpty().withMessage("Bidang is required"),

  body("tanggal").trim().escape().notEmpty().withMessage("Tanggal is required"),

  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("File is required");
    }
    return true;
  }),

  // Cek 🙂 validasi dan kirim error jika ad  a
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Lanjutkan ke handler berikutnya jika tidak ada error
  },
];

// export const validateAuth = [
//   body("username").trim().escape().withMessage("Username is required"),

//   body("email").trim().escape().notEmpty().withMessage("Email is required"),

//   body("password").trim().escape().withMessage("Password is required"),

//   // Cek 🙂 validasi dan kirim error jika ada
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }
//     next(); // Lanjutkan ke handler berikutnya jika tidak ada error
//   },
// ];
