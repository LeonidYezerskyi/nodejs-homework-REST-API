const User = require("../models/user.model");
const gravatar = require("gravatar");
const { hashPassword, comparePasswords } = require("../utils/hash.util");
const { jwtSign, jwtVerify } = require("../utils/jwt.util");

const signUp = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (user) {
    return res.status(409).send({
      message: "Email in use",
    });
  }

  const newUser = await User.create({
    email,
    password: hashPassword(password),
  });

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: newUser._id,
    },
    {
      token: jwtSign({ _id: newUser._id }),
    },
    {
      new: true,
    }
  ).select("-password");

  res.status(201).send({
    user: {
      email: updatedUser.email,
      subscription: updatedUser.subscription,
      avatarURL: gravatar.url(
        updatedUser.email,
        { s: "120", r: "x", d: "retro" },
        true
      ),
    },
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(401).send({
      message: "Email or password is wrong",
    });
  }

  const isPasswordValid = comparePasswords(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send({
      message: "Email or password is wrong",
    });
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
    },
    {
      token: jwtSign({ _id: user._id }),
    },
    {
      new: true,
    }
  ).select("-password");

  res.status(200).send({
    token: updatedUser.token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const logout = async (req, res) => {
  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      token: null,
    }
  );

  res.status(204).send(null);
};

const getUserByToken = async (req, res) => {
  res.send({ email: req.user.email, subscription: req.user.subscription });
};

const isAuthorized = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({
      message: "Not authorized",
    });
  }

  const decoded = jwtVerify(token);

  const user = await User.findOne({
    _id: decoded._id,
  });

  if (!user.token || !user._id) {
    return res.status(401).send({
      message: "Not authorized",
    });
  }

  req.user = user;

  next();
};

const updateUserAvatar = async (req, res) => {};

module.exports = {
  signUp,
  signIn,
  logout,
  getUserByToken,
  updateUserAvatar,
  isAuthorized,
};
