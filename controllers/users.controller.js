const Jimp = require("jimp");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");
const fs = require("fs/promises");
const { hashPassword, comparePasswords } = require("../utils/hash.util");
const { jwtSign, jwtVerify } = require("../utils/jwt.util");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

  const verificationToken = uuidv4();

  const newUser = await User.create({
    email,
    password: hashPassword(password),
    verificationToken,
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

  const msg = {
    to: email,
    from: process.env.SENDGRID_EMAIL,
    subject: "Verify your email",
    html: `<a href="${process.env.BASE_URL}/api/v1/users/verify/${newUser.verificationToken}">Verify your email</a>`,
  };

  sgMail.send(msg).then(
    (data) => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );

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

  if (!user.isVerified) {
    return res.status(401).send({
      message: "Not authorized",
    });
  }

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

const verifyUserFromEmail = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    res.status(404).send({
      message: "User not found",
    });
  }

  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verify: true,
  });

  res.status(200).send({
    message: "Verification successful",
  });
};

const resendEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user.verificationToken) {
    res.status(400).send({
      message: "Verification has already been passed",
    });
  }

  const msg = {
    to: email,
    from: process.env.SENDGRID_EMAIL,
    subject: "Verify your email",
    html: `<a href="${process.env.BASE_URL}/api/v1/users/verify/${user.verificationToken}">Verify your email</a>`,
  };

  sgMail.send(msg).then(
    (data) => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );

  res.status(200).json({
    message: "Verification email sent",
  });
};

module.exports = {
  signUp,
  signIn,
  logout,
  getUserByToken,
  isAuthorized,
  editAvatar,
  updateAvatar,
  verifyUserFromEmail,
  resendEmail,
};
