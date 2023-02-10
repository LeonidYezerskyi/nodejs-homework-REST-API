const express = require("express");
const Joi = require("joi");
const multer = require("multer");
const upload = multer();
const {
  signUp,
  signIn,
  logout,
  getUserByToken,
  isAuthorized,
  editAvatar,
  updateAvatar,
  verifyUserFromEmail,
  resendEmail,
} = require("../../controllers/users.controller");
const usersRouter = express.Router();
const tryCatch = require("../../utils/try-catch.util");

const schemaAddUser = Joi.object(
  {
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
    password: Joi.string().min(6).alphanum().required(),
  },
  { allowUnknown: false }
);

const schemaVerificationEmail = Joi.object(
  {
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
  },
  { allowUnknown: false }
);

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Missing required name field" });
    }
    next();
  };
};

usersRouter.post("/register", validateBody(schemaAddUser), tryCatch(signUp));
usersRouter.post("/login", validateBody(schemaAddUser), tryCatch(signIn));
usersRouter.post("/logout", isAuthorized, tryCatch(logout));

usersRouter.get("/current", isAuthorized, tryCatch(getUserByToken));
usersRouter.get("/verify/:verificationToken", tryCatch(verifyUserFromEmail));
usersRouter.post(
  "/verify",
  validateBody(schemaVerificationEmail),
  tryCatch(resendEmail)
);
usersRouter.patch(
  "/avatars",
  isAuthorized,
  upload.single("avatar"),
  editAvatar,
  async (req, res) => {
    const user = await updateAvatar(req.user._id, req.file.path);
    return res.status(200).send({
      avatarURL: user.avatarURL,
    });
  }
);

module.exports = usersRouter;
