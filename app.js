const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/api/users");
const filesRouter = require("./routes/api/files");

require("dotenv").config();

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.clh5w7k.mongodb.net/db-contacts?retryWrites=true&w=majority`
  )
  .then(() => console.log("Database connection successful!"));
const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(express.static("public/avatars"));
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);
app.use("/api/files", filesRouter);

app.use((err, req, res, next) => {
  if (err?.error?.isJoi) {
    return res.status(400).json({
      type: err.type,
      message: err.error.toString(),
    });
  }

  if (err?.code === 11000) {
    return res.status(400).json({ message: "Duplicate key error" });
  }

  if (err) {
    return res.status(500).json({ message: "Internal server error" });
  }

  res.status(404).json({ message: "Not found" });
});

module.exports = app;
