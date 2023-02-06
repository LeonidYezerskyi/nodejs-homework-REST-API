const express = require("express");
const multer = require("multer");
const fs = require("fs/promises");
const filesRouter = express.Router();

const upload = multer();

filesRouter.post("/", upload.single("avatar"), async (req, res) => {
  const fileName = "avatar-" + Date.now();
  const fileType = req.file.mimetype.split("/")[1];

  await fs.writeFile(`./tmp/${fileName}.${fileType}`, req.file.buffer);
  res.send("Ok");
});

module.exports = filesRouter;
