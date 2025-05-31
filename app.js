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

// Database sync
(async () => {
  await sequelize.sync({ force: false });
})();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"))
app.use(session({
  secret: process.env.SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false, httpOnly: true, sameSite: "strict"},

}))

const userMil = async (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).json({ ok: false, message: "Not authenticated", location: "/" });
  }

  try {
    const user = await User.findOne({
      where: {
        username: sessionUser.username
      }
    });

    if (!user) {
      return res.status(403).json({ ok: false, message: "User not found or deleted", location: "/" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Server error", location: "/" });
  }
};

app.get("/dashboard",async (req, res, next) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).redirect("/")
  }

  try {
    const user = await User.findOne({
      where: {
        username: sessionUser.username
      }
    });

    if (!user) {
      return res.status(403).redirect("/")
    }

    if (!user) return res.redirect("/");

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/")
  }
})

app.get("/user", userMil, async (req, res) => {
  try {

    let user = await User.findOne({
      where: {
        username: req.user.username
      },
      attributes: {
        exclude: ["password"]
      }
    })

    let data = {
      ...user.toJSON(),
      files: await user.getFiles({
        raw: true,
      })
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: e.message, location: "/" });
  }
})

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

    if( c ) {
      req.session.user = c;
      return res.status(200).json({
        ok: true,
        location: "/dashboard",
      })
    }
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
    let user = await User.findOne({
      where: {username: username}
    });

    if( !user) {
      return res.status(402).json({
        ok: false,
        message: "User not fount",
        location: "/"
      });
    }

    if (user.isSoftDeleted()) {
      return res.status(403).json({
        ok: false,
        message: "User is deleted",
        location: "/"
      })
    }

    if (!user.isValidPassword(password)) {
      return res.status(401).json({
        ok: false,
        message: "Incorrect username or password",
        location: "/"
      });
    }

    req.session.user = user;

    return res.status(200).json({
      ok: true,
      location: "/dashboard",
    })
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({
      ok: false,
      message: e.message,
      location: "/"
    });
  }
});

app.post("/upload",userMil, upload.array("files"), async (req, res) => {
  const {user} = req;
  if (!user || user.deletedAt) {
    return res.status(403).json({ ok: false, message: "User does not exist or is deleted" });
  }

  try {
    const savedFiles = [];

    for (const file of req.files) {
      const newFile = await File.create({
        name: file.originalname,
        file: file.buffer,
        type: file.mimetype,
        visibility: true,
        userId: user.id,
      });
      savedFiles.push(newFile);
    }

    await user.addFiles(savedFiles);

    return res.status(200).json({
      ok: true,
      message: "Files uploaded successfully",
      files: savedFiles.map(f => ({
        id: f.id,
        name: f.name,
        uuid: f.uuid,
        visibility: f.visibility,
      })),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ ok: false, message: "Failed to upload files" });
  }
});

app.get("/files",userMil, async (req, res) => {
  const {user} = req;

  if (!user || user.deletedAt) {
    return res.status(403).json({ ok: false, message: "User does not exist or is deleted" });
  }

  let files = await user.getFiles({
    attributes: ["id","name", "file", "visibility", "createdAt", "deletedAt"],
    paranoid: false,
    raw: true,
  });

  return res.status(200).json({
    ok: true,
    files
  })
})

app.post("/action/:type/:id", userMil, async (req, res) => {
  const {type, id} = req.params;
  const {visibility = null, name = null} = req.body;
  const {user} = req;

  try {
    let files = await user.getFiles({
      where: {id},
      paranoid: false,
      limit: 1
    });

    // Fix: getFiles returns an array, so check if array is empty or get first item
    if (!files || files.length === 0) {
      return res.status(403).json({ ok: false, message: "file does not exist or is deleted" });
    }

    let file = files[0]; // Get the first (and only) file from the array

    switch (type) {
      case "visibility":
        if (visibility === null || !(visibility === "1" || visibility === "0")) {
          return res.status(403).json({ok: false, message: "Invalid param visibility"});
        }

        await file.update({ visibility: visibility === "1" });
        return res.status(200).json({ok: true, message: "File visibility updated successfully"});

      case "name":
        if (name === null) {
          return res.status(403).json({ok: false, message: "Invalid name"});
        }

        await file.update({ name: name });
        return res.status(200).json({ok: true, message: "File updated successfully"});

      case "delete":
        if (file.isSoftDeleted()) {
          return res.status(403).json({ok: false, message: "File was deleted"});
        }

        await file.destroy();
        return res.status(200).json({ok: true, message: "File was deleted"});

      case "recover":
        if (!file.isSoftDeleted()) {
          return res.status(403).json({ok: false, message: "File was not deleted"});
        }

        await file.restore();
        return res.status(200).json({ok: true, message: "File was restored"});

      default:
        return res.status(500).json({ok: false, message: "invalid parameter"});
    }

  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: e.message,
    });
  }
});

app.put("/change", userMil, async (req, res) => {
  const {user} = req;
  let {username = null, firstname = null, lastname = null} = req.body;

  try {
    if( username === null) username = user.username;
    if( firstname === null ) firstname = user.firstname;
    if( lastname === null ) lastname = user.lastname;

    const updatedUser = await User.findOne({
      where: { id: user.id },
      attributes: { exclude: ["password"] }
    });

    const userData = {
      ...updatedUser.toJSON(),
      files: await updatedUser.getFiles({ raw: true })
    };

    return res.status(200).json({
      ok: true,
      message: "User changed successfully",
      user: userData  // Return updated user data
    });
  } catch (e) {
    return res.status(500).json({ok: false, message: e.message})
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
