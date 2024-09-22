import path from "path";
import fs from "fs";

export const HandleFileService = {
  async GetFileGambar(req, res) {
    try {
      const filename = req.params.filename;
      const filepath = path.join(process.cwd(), "uploads", "photos", filename);

      // Cek apakah file ada di folder
      if (fs.existsSync(filepath)) {
        // Kirim menggunakan binary
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Content-Disposition", `inline; filename=${filename}`);

        return res.sendFile(filepath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
          }
        });
      } else {
        return res.status(404).json({
          status_code: 404,
          status: false,
          message: "File not found",
        });
      }
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
    }
  },
  async GetFileVideo(req) {
    try {
      return {
        status_code: 201,
        status: true,
        message: "Success get video",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
    }
  },
  async GetFileDocument(req) {
    try {
      return {
        status_code: 201,
        status: true,
        message: "Success get document",
      };
    } catch (error) {
      return {
        status_code: 500,
        status: false,
        message: "Internal server error",
      };
    }
  },
};
