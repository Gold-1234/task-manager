import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

//configure cloudinary
cloudinary.config({ 
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localfilePath) => {
	try {
		if(!localfilePath) return null

		const response = await cloudinary.uploader

		.upload(localfilePath, {
			resource_type: "auto"
		})

		console.log("File uploaded on cloudinary. File src: " + response.url);
		//after upload, delete from server
		fs.unlinkSync(localfilePath)

		return response;

	} catch (error) {
		console.log("cloudinary error: ", error);
		fs.unlinkSync(localfilePath)
		return null
	}
}

const deleteFromCloudinary = async(publicId, resource_type = 'image') => {
	try {
		
		const result = await cloudinary.uploader.destroy(publicId, {resource_type: resource_type})
		console.log(publicId, result);

		
	} catch (error) {
		console.log("error deleting from cloudinary", error);
	}
}

export { uploadOnCloudinary, deleteFromCloudinary}