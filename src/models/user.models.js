import { Schema } from "mongoose"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import crypto, { hash } from "crypto"
import bcrypt from "bcryptjs"

const userSchema = new Schema({
	fullname: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		index: true
	},
	avatar: {
		type: {
			url: String,
			localPath: String
		},
		default: {
			type: 'https://placehold.co/600x400',
			localPath: ''
		}
	},
	email:{
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		rquired: true
	},
	isEmailVerified: {
		type: Boolean,
		required: true,
		default: false
	},
	refreshToken: {
		type: String,
	},
	forgotPasswordToken: {
		type: String,
	},
	forgotPasswordExpiry: {
		type: String,
	},
	emailVerificationToken : {
		type: String,
	},
	emailVerificationExpiry: {
		type: Date,
	}
},{
	timestamps: true
})

userSchema.pre("save", async function(next){
	if(!this.isModified("password")){
		return next()
	}
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

userSchema.methods.isPasswordCorrect = async function(password){
	return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
	try {
		return jwt.sign(
			{
			_id: this._id,
			email: this.email,
			username: this.username
			},
			process.env.ACCESS_TOKEN_SECRET,
			{
				expiresIn: process.env.ACCESS_TOKEN_EXPIRY
			})

	} catch (error) {
		console.log('error generating token', error);
		
	}
}

userSchema.methods.generateRefreshToken = async function(){
	const token = jwt.sign(
		{
		_id: this._id,
		email: this.email,
		username: this.username
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY
		}
	)
	return token
}

userSchema.methods.generateTemporaryToken = async function(){
	try {
		const unhashedToken = crypto.randomBytes(20).toString('hex')
		const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex")
	
		const tokenExpiry = Date.now() + (15*60*1000) //15 mins
		console.log(unhashedToken);
		
		return {unhashedToken, hashedToken, tokenExpiry}
	} catch (error) {
		console.log(error);
		
	}
}

export const User = mongoose.model("User", userSchema)