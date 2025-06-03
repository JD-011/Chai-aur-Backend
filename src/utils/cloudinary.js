import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // file has been uploaded successfully
        // console.log("file uploaded on cloudinary, url: ", response.url);
        return response;
    } catch (err) {
        console.error("Error in uploading file to cloudinary: ", err);
        return null;
    } finally {
        if (localFilePath) fs.unlinkSync(localFilePath);
    }
};

export { uploadOnCloudinary };
