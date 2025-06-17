import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { forgotPasswordMailGenContent, sendMail } from "../utils/mail.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailGenContent } from "../utils/mail.js";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullname } = req.body;

  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required : /");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, `User already registered! Please login :3`);
  }

  const user = await User.create({ fullname, email: email.toLowerCase(), password, username: username.toLowerCase() });
  const { unhashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();
  if(!unhashedToken || !hashedToken || !tokenExpiry){
    throw new ApiError(400, "Token couldn't be generated")
  }
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Verify your email",
      mailGenContent: emailVerificationMailGenContent(user.fullname, verificationURL),
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(422, "Error sending email", [error.message]);
  }

  const newUser = await User.findOne({
    $or: [ { email: email.toLowerCase() }, { username: username.toLowerCase() } ],
  }).select("-password -emailVerificationToken -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationExpiry");

  return res.status(201).json(new ApiResponse(201, { user: newUser, verificationURL }, "User registered successfully ><"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "All fields are required : /");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "user not found!");

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(401, "Invalid credentials : /");

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production" };

  const loggedInUser = await User.findById(user._id).select("-password -emailVerificationToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationExpiry");
  if (!loggedInUser) throw new ApiError(401, "User couldn't be found");

  return res.status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .setHeader('Authorization', `${accessToken}`)
    .json(new ApiResponse(201, loggedInUser, "Logged in successfully >. .<"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const email = user.email;

  const foundUser = await User.findOne({ email });
  if (!foundUser) throw new ApiError(401, "User not found");

  foundUser.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production" };

  return res.status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, null, "Logged out /"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const unhashedToken = req.params.unhashedToken;
  const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");
  const user = await User.findOne({ emailVerificationToken: hashedToken });

  if (!user) throw new ApiError(400, "user not found!");

  if (user.emailVerificationExpiry > Date.now()) {
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: true });

    return res.status(200).json(new ApiResponse(200, user, "user verified"));
  } else {
    throw new ApiError(401, "Time Out to verify your token");
  }
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const email = req.user.email;
  const user = await User.findOne({ email });

  const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`;

  try {
    const sentEmail = await sendMail({
      email: user.email,
      subject: "Verify your email",
      mailGenContent: emailVerificationMailGenContent(user.fullname, verificationURL, tokenExpiry / (60 * 1000)),
    });
    return res.json(new ApiResponse(200, sentEmail, "Email sent"));
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(422, "Error sending email", [error.message]);
  }
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "user not found");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "user not found");

  const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const forgotPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unhashedToken}`;
  const expiryInMinutes = Math.round((tokenExpiry - Date.now()) / (60 * 1000));

  try {
    const sentEmail = await sendMail({
      email: email,
      subject: "Reset Password",
      mailGenContent: forgotPasswordMailGenContent(user.fullname, forgotPasswordURL, expiryInMinutes),
    });
    return res.status(200).json(new ApiResponse(200, { sentEmail, forgotPasswordURL }, "Email to reset password sent successfully."));
  } catch (error) {
    throw new ApiError(401, "error sending email", [error.message]);
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  const newAccessToken = await user.generateAccessToken();
  if (!newAccessToken) throw new ApiError(400, "error refreshing token");
  return res.status(200).json(new ApiResponse(200, newAccessToken, "Access token reset successful"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, oldPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "user not found");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(401, "incorrect password, Please reset.");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, null, "Password updated successfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email }).select("-password -emailVerificationToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationExpiry");
  if (!user) throw new ApiError(401, "user not found");
  return res.status(200).json(new ApiResponse(200, user, "User fetched successfully."));
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
