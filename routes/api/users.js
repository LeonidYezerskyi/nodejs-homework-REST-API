const express = require("express");
const Joi = require("joi");
const {
  signUp,
  signIn,
  logout,
  getUserByToken,
  isAuthorized,
  updateUserAvatar,
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
usersRouter.patch("/avatars", isAuthorized, tryCatch(updateUserAvatar));

module.exports = usersRouter;
