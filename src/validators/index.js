import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Invalid email."),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required.")
      .isLength({ min: 3 })
      .withMessage("Minimum length required is 3")
      .isLength({ max: 8 })
      .withMessage("maxium length cannot exceed 8"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 8 })
      .withMessage("Minimum length required is 8")
      .isLength({ max: 16 })
      .withMessage("Maxium length cannot exceed 16")
      .matches(/[a-z]/)
      .withMessage("Password must contain atleast one lower case character")
      .matches(/[A-Z]/)
      .withMessage("Password must contain atleast one upper case character")
      .matches(/\d/)
      .withMessage("Password must contain atleast numeric character")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain atleast special character"),
  ];
};

const userLoginValidator = () => {
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email."),
    body("password").trim().notEmpty().withMessage("Password is required.");
};

export { userRegistrationValidator, userLoginValidator };
