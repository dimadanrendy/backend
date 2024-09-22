import path from "path";
import fs from "fs";

export const HandleFileService = {
  async GetFileGambar(req, res) {
    try {
      const filename = req.params.filename;
      const filepath = path.join(process.cwd(), "uploads", "photos", filename);

      // Cek apakah file ada di folder
      if (fs.existsSync(filepath)) {
        // jika file png
        if (filename.endsWith(".png")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const image = `data:image/png;base64,${base64}`;

          return res.send(image);
        }

        // Rubah menjadi image base64
        const base64 = fs.readFileSync(filepath, { encoding: "base64" });
        const image = `data:image/jpeg;base64,${base64}`;

        return res.send(image);
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
  async GetFileVideo(req, res) {
    try {
      const filename = req.params.filename;
      const filepath = path.join(process.cwd(), "uploads", "videos", filename);

      // Cek apakah file ada di folder
      if (fs.existsSync(filepath)) {
        // jika file .avi
        if (filename.endsWith(".avi")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const video = `data:video/avi;base64,${base64}`;

          return res.send(video);
        }

        // jika file .mp4
        if (filename.endsWith(".mp4")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const video = `data:video/mp4;base64,${base64}`;

          return res.send(video);
        }

        // jika file .mov
        if (filename.endsWith(".mov")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const video = `data:video/quicktime;base64,${base64}`;

          return res.send(video);
        }

        // jika file .mkv
        if (filename.endsWith(".mkv")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const video = `data:video/x-matroska;base64,${base64}`;

          return res.send(video);
        }

        // Rubah video menjadi base64
        // const base64 = fs.readFileSync(filepath, { encoding: "base64" });
        // const video = `data:video/mp4;base64,${base64}`;

        // return res.send(video);
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
  async GetFileDocument(req, res) {
    try {
      const filename = req.params.filename;
      const filepath = path.join(
        process.cwd(),
        "uploads",
        "documents",
        filename
      );

      // Cek apakah file ada di folder
      if (fs.existsSync(filepath)) {
        // jika file rar
        if (filename.endsWith(".rar")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const document = `data:application/x-rar-compressed;base64,${base64}`;

          return res.send(document);
        }

        // jika file zip
        if (filename.endsWith(".zip")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const document = `data:application/zip;base64,${base64}`;
          return res.send(document);
        }

        // jika file pdf
        if (filename.endsWith(".pdf")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const document = `data:application/pdf;base64,${base64}`;
          return res.send(document);
        }

        // jika file docx
        if (filename.endsWith(".docx")) {
          const base64 = fs.readFileSync(filepath, { encoding: "base64" });
          const document = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
          return res.send(document);
        }

        //rubah menjadi document base64

        // const base64 = fs.readFileSync(filepath, { encoding: "base64" });
        // const document = `data:application/pdf;base64,${base64}`;
        // return res.send(document);
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
};
