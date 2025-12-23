import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

console.log("Cloudinary ENV check:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
  secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No file path provided.");
            return null;
        }

        console.log("Uploading to Cloudinary...");

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log("Upload successful:", response.secure_url);

        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);

        // Ensure the file is deleted even if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadOnCloudinary };
