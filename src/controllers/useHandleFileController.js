import { HandleFileService } from "../service/useHandleFileService.js";
import path from "path";
import fs from "fs";

export const HandleFileGambar = (req, res) => {
  HandleFileService.GetFileGambar(req, res);
};

export const HandleFileGambarPegawai = (req, res) => {
  HandleFileService.GetFileGambarPegawai(req, res);
};

export const HandleFileVideo = (req, res) => {
  HandleFileService.GetFileVideo(req, res);
};

export const HandleFileDocument = (req, res) => {
  HandleFileService.GetFileDocument(req, res);
};
