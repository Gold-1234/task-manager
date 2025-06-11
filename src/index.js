import app from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/connectToDB.js";

dotenv.config({
	path: "./.env"
})

console.log(process.env.PORT);

const PORT = process.env.PORT || 8000

connectDB()
.then(() => {
	app.listen(PORT, () => {
		console.log(`App listening on port ${PORT}`)
	})
})
.catch((error) => {
	console.log(`error: ${error}`)
	process.exit(1)
})