import mongoose from "mongoose"

const connectToDB = async() => {
	try {
		const result = await mongoose.connect(process.env.MONGO_URI)
		if(result){
			console.log(`Mongo DB connected`);
		}
	} catch (error) {
		throw new Error(error);
	}
}
export default connectToDB