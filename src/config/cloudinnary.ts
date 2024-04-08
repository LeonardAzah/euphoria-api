import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

interface UploadResult {
  url: string;
  id: string;
}

export const uploads = (
  file: string,
  folder: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        resource_type: "auto",
        folder: folder,
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          const uploadResult: UploadResult = {
            url: result.url,
            id: result.public_id,
          };
          resolve(uploadResult);
        }
      }
    );
  });
};
