import multer from "multer";
import { RequestHandler, Request } from "express";

const DIR = "./uploads";

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, DIR);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter: multer.FileFilterCallback = (req, file, cb) => {
  const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedFormats.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

const uploads = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: fileFilter,
}) as RequestHandler;

export default uploads;
