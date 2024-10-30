import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import fs from "fs";
import path from "path";

// Routing
import useDocumentsRoute from "./routes/useDocumentsRoute.js";
import usePhotosRoute from "./routes/usePhotosRoute.js";
import useVideosRoute from "./routes/useVideosRoute.js";
import useUsersRoute from "./routes/useUsersRoute.js";
import useAuthRoute from "./routes/useAuthRoute.js";
import useHandleFileRoute from "./routes/useHandleFileRoute.js";

// Middleware
import { tokenAccessServer } from "./middleware/tokenAccessServer.js";

// Load env variables
dotenv.config();

// Limit request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // limit each IP to 100 requests per windowMs
});

// Init
const app = express();
const PORT = process.env.PORT || 5000;
const PATCH = process.env.BASE_ROUTE;

//origin
// const allowedOrigins = [
//   "http://localhost",
//   "http://localhost:3000",
//   "http://192.168.81.45",
//   "http://192.168.81.45:3000",
//   "http://192.168.200.110",
//   "http://192.168.200.110:3000",
//   "https://bakeuda.muhammadrendyariawan.site",
//   "https://backend.muhammadrendyariawan.site",
// ];
const allowedOrigins = ["https://bakeuda.muhammadrendyariawan.site"];
// Middleware limiter
app.use(limiter);

// Middleware cors
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(tokenAccessServer);

// Star Code Logger

// Buat folder logs jika belum ada
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Buat stream untuk logging ke file
const stream = fs.createWriteStream(path.join(logDir, "app.log"), {
  flags: "a",
});

// Buat logger
const logger = pino({ level: "info", redact: ["res.headers"] }, stream);
const httpLogger = pinoHttp({ logger }); // Logger untuk HTTP

// Gunakan pino-http sebagai middleware
app.use(httpLogger);

// end Code Logger

// Middleware cookie parser
app.use(cookieParser());

// Routes Handler
app.use(`${PATCH}/documents`, useDocumentsRoute);
app.use(`${PATCH}/photos`, usePhotosRoute);
app.use(`${PATCH}/videos`, useVideosRoute);
app.use(`${PATCH}/users`, useUsersRoute);
app.use(`${PATCH}/auth`, useAuthRoute);
app.use(`${PATCH}/file`, useHandleFileRoute);

app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan");
});

app.use((err, req, res, next) => {
  res.status(400).json({
    status_code: 400,
    status: false,
    message_error: err.message,
  });
});

// Listen
app.listen(PORT, () => {
  console.log(`Server sedang berjalan at ${PORT}`);
});
