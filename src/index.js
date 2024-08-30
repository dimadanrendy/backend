import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Routing
import useDocumentsRoute from "./routes/useDocumentsRoute.js";
import usePhotosRoute from "./routes/usePhotosRoute.js";
import useVideosRoute from "./routes/useVideosRoute.js";

// Middleware
import { tokenAccessServer } from "./middleware/tokenAccessServer.js";

dotenv.config();

// Init
const app = express();
const PORT = process.env.PORT || 5000;
const PATCH = process.env.BASE_ROUTE;

// Middleware cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(tokenAccessServer);

// Routes Handler
app.use(`${PATCH}/documents`, useDocumentsRoute);
app.use(`${PATCH}/photos`, usePhotosRoute);
app.use(`${PATCH}/videos`, useVideosRoute);

app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan");
});

// Listen
app.listen(PORT, () => {
  console.log(`Server sedang berjalan at ${PORT}`);
});
