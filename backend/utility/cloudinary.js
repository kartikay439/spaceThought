import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config(
    {
    cloud_name: "dyskcht0s",
    api_key: "589919667186923",
    api_secret: "BIa2h7dfTnN3-zyUREl-U-CWT38"
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
