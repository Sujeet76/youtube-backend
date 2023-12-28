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
    console.log(localPath);
    const option = { folder };
    if (height) option.height = height;
    if (quality) option.quality = quality;
    option.resourceType = "auto";

    // upload file to cloudinary => file larger then 100mb
    const response = await v2.uploader.upload(localPath, option);

    // remove file from public folder
    fs.unlinkSync(localPath);
    return response;
  } catch (error) {
    fs.unlinkSync(localPath);
    console.log("Error while uploading file error => ", error);
    return null;
  }
};

export const deleteFromCloudinary = async (localPath) => {
  try {
    if (!localPath) return null;
    console.log(localPath);
    v2.api
      .delete_resources([localPath], {
        type: "upload",
        resource_type: "image",
        invalidate : true
      })
      .then((data) => {
        console.log("Deleted!!");
        return data;
      })
      .catch((err) => {
        console.log("Err => ", err);
      });
  } catch (error) {
    console.log(`Error while deleting image error : ${error}`);
    return null;
  }
};
// http://res.cloudinary.com/dcplnllih/image/upload/v1703739261/youtube/images/safsf2tz9ll5xo4n35wd.png
