import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Function to upload a file on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


// Function to delete a file by its URL
const deleteFileFromCloudinary = async(fileUrls) => {
    fileUrls.forEach((fileUrl) => {
        // Extract public ID from URL (adjust as per your URL structure)
        const publicId = fileUrl.split('/').pop().split('.')[0];
    
        // Determine if the file is a video or image by checking the extension
        const isVideo = fileUrl.endsWith('.mp4') || fileUrl.endsWith('.avi') || fileUrl.endsWith('.mov');
    
        // Delete the file using the correct resource type
        cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' }, (error, result) => {
          if (error) {
            console.error(`Error deleting file ${fileUrl}:`, error);
          } else {
            console.log(`File deleted successfully: ${fileUrl}`);
          }
        });
      });
  };
  

export {uploadOnCloudinary,deleteFileFromCloudinary}