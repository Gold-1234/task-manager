import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { forgotPasswordMailGenContent, sendMail } from "../utils/mail.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailGenContent } from "../utils/mail.js";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullname } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required : /");
  }

  try {
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      throw new ApiError(409, `User already registered! Please login :3`);
    }

    const user = await User.create({
      fullname,
      email: email.toLowerCase(),
      password,
      username: username.toLowerCase(),
    });

    // generate email verification token
    const { unhashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    const verificationURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Verify your email",
        mailGenContent: emailVerificationMailGenContent(
          user.fullname,
          verificationURL,
        ),
      });
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      console.log("email error: ", error);
      throw new ApiError(422, "Error sending email", [error.message]);
    }

    const newUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    }).select(
      "-password -emailVerificationToken -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationExpiry",
    );

    return res.status(201).json(
      new ApiResponse(201, "User registered successfully ><", {
        user: newUser,
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.log(error);

    throw new ApiError(500, "Error registering user", [error.message]);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required : /");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user not found!");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials : /");
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true, //cookie non modifiable from client
    secure: process.env.NODE_ENV === "production",
  };

  const loggedInUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationExpiry",
  );

  if (!loggedInUser) {
    throw new ApiError(401, "User coudn't be found");
  }

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(201, "Logged in successfully >. .<"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const email = user.email;
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      throw new ApiError(401, "User not found");
    }
    foundUser.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true, //cookie non modifiable from client
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", "", options)
      .cookie("refreshToken", "", options)
      .json(new ApiResponse(200, "Logged out /"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Couldn't logout user", [error.message]);
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const unhashedToken = req.params.unhashedToken;

    const hashedToken = crypto
      .createHash("sha256")
      .update(unhashedToken)
      .digest("hex");
    const user = await User.findOne({ emailVerificationToken: hashedToken });

    if (!user) {
      console.log("user not found, please login");

      return res.status(400).json(new ApiResponse(400, "user not found!"));
    }
    if (user.emailVerificationExpiry > Date.now()) {
      console.log("true");

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpiry = undefined;
      await user.save({ validateBeforeSave: true });
      console.log("user verified!");

      return res.status(200).json(new ApiResponse(200, "user verified", user));
    } else {
      throw new apiError(401, "Time Out to verify your token");
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json(new ApiResponse(400, "Couldn't verify user", error));
  }
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const email = req.user.email;

  const user = await User.findOne({ email });
  console.log(user);

  const { unhashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`;

  try {
    const sentEmail = await sendMail({
      email: user.email,
      subject: "Verify your email",
      mailGenContent: emailVerificationMailGenContent(
        user.fullname,
        verificationURL,
        tokenExpiry / (60 * 1000),
      ),
    });

    return res.json(new ApiResponse(200, "Email sent", sentEmail));
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    console.log("email error: ", error);

    throw new ApiError(422, "Error sending email", [error.message]);
  }
  //validation
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "user not found");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successful"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email);

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "user not found");
  }
  const { unhashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const forgotPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unhashedToken}`;
  const expiryInMinutes = Math.round((tokenExpiry - Date.now()) / (60 * 1000));
  try {
    const sentEmail = await sendMail({
      email: email,
      subject: "Reset Password",
      mailGenContent: forgotPasswordMailGenContent(
        user.fullname,
        forgotPasswordURL,
        expiryInMinutes,
      ),
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Email to reset password sent successfully.",
          sentEmail,
        ),
      );
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "error sending email", error);
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email } = req.user;

  try {
    const user = await User.findOne({ email });

    const newAccessToken = await user.generateAccessToken();
    if (!newAccessToken) {
      new ApiResponse(400, "error refreshing token", error);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Access token reset succesfull", newAccessToken),
      );
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json(new ApiResponse(400, "error refreshing token", error));
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, oldPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "user not found");
  }
  if (user.password !== oldPassword) {
    return res.status(401, "incorrect password, Please reset.");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email } = req.user;

  const user = await User.findOne({ email }).select(
    "-password -emailVerificationToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationExpiry",
  );

  if (!user) {
    return res.json(new ApiError(401, "user not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully.", user));
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
