import { v2 } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_IMAGE_FOLDER } from "../constant.js";

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  localPath,
  folder = CLOUDINARY_IMAGE_FOLDER,
  height,
  quality
) => {
  try {
    if (!localPath) return null;

    const option = { folder };
    if (height) option.height = height;
    if (quality) option.quality = quality;
    option.resourceType = "auto";

    // upload file to cloudinary => file larger then 100mb
    const response = await new Promise.resolve((resolve, reject) => {
      v2.uploader.upload_large(localPath, option, (error, response) => {
        if (error) {
          reject(error);
        }
        resolve(response);
      });
    });

    // remove file from public folder
    fs.unlinkSync(localPath);
    return response;
  } catch (error) {
    fs.unlinkSync(localPath);
    console.log("Error while uploading file error => ", error);
    return null;
  }
};
