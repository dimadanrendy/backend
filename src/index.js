import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// Routing
import useDocumentsRoute from "./routes/useDocumentsRoute.js";
import usePhotosRoute from "./routes/usePhotosRoute.js";
import useVideosRoute from "./routes/useVideosRoute.js";
import useUsersRoute from "./routes/useUsersRoute.js";
import useAuthRoute from "./routes/useAuthRoute.js";
import useHandleFileRoute from "./routes/useHandleFileRoute.js";

// Middleware
import { tokenAccessServer } from "./middleware/tokenAccessServer.js";

dotenv.config();

// Limit request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Init
const app = express();
const PORT = process.env.PORT || 5000;
const PATCH = process.env.BASE_ROUTE;

// Middleware limiter
app.use(limiter);

// Middleware cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
// app.use(tokenAccessServer);

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
