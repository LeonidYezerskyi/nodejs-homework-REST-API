const User = require("../models/user.model");

const gravatar = require("gravatar");
const fs = require("fs/promises");
const Jimp = require("jimp");
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

const editAvatar = async (req, res, next) => {
  const fileName =
    req.user._id + Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileType = req.file.mimetype.split("/")[1];
  await fs.writeFile(`./tmp/${fileName}.${fileType}`, req.file.buffer);
  Jimp.read(`./tmp/${fileName}.${fileType}`)
    .then((file) => {
      return file
        .resize(250, 250)
        .quality(60)
        .writeAsync(`./public/avatars/${fileName}.${fileType}`);
    })
    .catch((err) => {
      console.error(err);
    });
  req.file.path = `/public/avatars/${fileName}.${fileType}`;
  await fs.unlink(`./tmp/${fileName}.${fileType}`);

  next();
};

const updateAvatar = async (_id, avatarURL) => {
  const user = await User.findByIdAndUpdate(
    { _id },
    { avatarURL },
    { new: true }
  );
  return user;
};

module.exports = {
  signUp,
  signIn,
  logout,
  getUserByToken,
  isAuthorized,
  editAvatar,
  updateAvatar,
};
