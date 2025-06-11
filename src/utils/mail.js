//factory function 
import Mailgen from "mailgen";
import nodemailer from "nodemailer"
import { ApiError } from "./api-error.js";
import dotenv from 'dotenv'

dotenv.config({
	path: "../.env"
})

export const sendMail = async(options) => {	
	console.log(process.env.PORT);
	
	console.log("Current working directory:", process.cwd());
	console.log("host :", process.env.MAILTRAP_SMTP_HOST);
	
    const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'Mailgen',
        link: 'https://mailgen.js/'
        // logo: 'https://mailgen.js/img/logo.png'
    }
})
	var emailBody = mailGenerator.generate(options.mailGenContent);

	var emailText = mailGenerator.generatePlaintext(options.mailGenContent);

	const transporter = nodemailer.createTransport({
	host: process.env.MAILTRAP_SMTP_HOST,
	port: process.env.MAILTRAP_SMTP_PORT,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.MAILTRAP_SMTP_USER,
		pass: process.env.MAILTRAP_SMTP_PASSWORD,
	},
	});

	try {
		
		const info = await transporter.sendMail({
				from: 'mail.projector@example.com',
				to: options.email,
				subject: options.subject,
				text: emailText, // plain‑text body
				html: emailBody, // HTML body
	  	})

		console.log('Email sent: %s', info.messageId);
    	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		return info
	} catch (error) {
		console.log(error);
		new ApiError(401, 'Error sending mail', error)
	}

	
}

export const emailVerificationMailGenContent = (fullname, verificationURL, tokenExpiry) => {
	return {
		body: {
			name: fullname,
			intro: `Welcome to ProjectOr! We\'re very excited to have you on board.`,
			action: {
            instructions: 'To get started with ProjectOr, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'verify your email <3',
                link: verificationURL
            }
        },
		outro: `The link is valid for ${tokenExpiry}. \ Need help, or have questions? Just reply to this email, we\'d love to help.`
		}
	}
}

export const forgotPasswordMailGenContent = (username, passwordResetURL, tokenExpiry) => {
	return {
		body: {
			name: username,
			intro: `We got a request to update your password`,
			action: {
            instructions: `To get change your password, click the button. The link is valid for ${tokenExpiry} minutes`,
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Reset Password',
                link: passwordResetURL
            }
        },
		outro: "Not You? Someone might have mistakenly entered your mail. Please, Ignore the mail in such case."
		}
	}
}

// sendMail({
// 	email: user.email,
// 	subject: "aaa",
// 	mailGenContent : emailVerificationMailGenContent(
// 		username,
// 		`url`
// 	)
// })
