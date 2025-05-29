require("ts-node").register();
const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const session = require("express-session");
const {sequelize, User, File} = require("./database/associations");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();
const upload = multer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"))
app.use(session({
  secret: process.env.SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false, httpOnly: true, sameSite: "strict"},

}))

app.post("/upload", upload.any(), (req, res) => {
  console.log("Files:", req.files);
  console.log("Body:", req.body);
  res.json({ files: req.files, body: req.body });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
