import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(urlencoded({extended: true}))
app.use(express.json())
app.use(cors({
	origin: process.env.CORS_ORIGIN || [
		"http://localhost:8000",
		"http://127.0.0.1:8000"
	],
	credentials: true
}
))
app.use(cookieParser())
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

//router imports
import healthCheckRouter from "./routes/healthcare.routes.js"
import userRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js"

app.use('/api/v1/healthcheck', healthCheckRouter)
app.use('/api/v1/auth', userRouter)
app.use('/api/v1/project', projectRouter)



export default app