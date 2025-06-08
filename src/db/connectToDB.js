import mongoose from "mongoose"

const connectDB = async() => {
	try {
		const result = await mongoose.connect(process.env.MONGO_URI)
		if(result){
			console.log('mongo db connected')
		}
		
	} catch (error) {
		console.log(`Mongo DB connectrion error: ${error}`);
		throw new Error(error);
		
	}
}
export default connectDB