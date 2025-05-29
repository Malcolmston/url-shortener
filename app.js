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

app.post("/signup", async (req, res) => {
  const {firstname, lastname, username, password} = req.body;

  try {
    let user = await User.findOne({where: {username: username}});

    if( user) {
      return res.status(402).json({
        ok: false,
        message: "User already exists",
        location: "/"
      })
    } else if( user.isSoftDeleted() ) {
      return res.status(403).json({
        ok: false,
        message: "User is deleted",
        location: "/"
      })
    }

    let c = await User.create({
      firstname,
      lastname,
      username,
      password,
    })

    if( c ) return res.status(200).json({
      ok: true,
      location: "/dashboard",
    })
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: e.message,
      location: "/"
    })
  }
});

app.post("/login", async (req, res) => {
  const {username, password} = req.body;

  try {
    let user = await User.findOne({where: {username: username}});

    if( !user) {
      return res.status(402).json({
        ok: false,
        message: "User not fount",
        location: "/"
      })
    } else if( user.isSoftDeleted() ) {
      return res.status(403).json({
        ok: false,
        message: "User is deleted",
        location: "/"
      })
    }

    if( !user.isValidPassword(password) ) return res.status(403).json({
      ok: false,
      message: "incorrect username or password",
      location: "/"
    })

    req.session.user = user;

    return res.status(200).json({
      ok: true,
      location: "/dashboard",
    })
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: e.message,
      location: "/"
    })
  }
})

app.post("/upload", upload.any(), (req, res) => {
  console.log("Files:", req.files);
  console.log("Body:", req.body);
  res.json({ files: req.files, body: req.body });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
