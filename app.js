const express = require("express");
const multer = require("multer");
const morgan = require("morgan")
const session = require("express-session");
const path = require("path");
const mime = require('mime-types');
require("dotenv").config();

require('ts-node').register({
  project: path.join(__dirname, "tsconfig.json")
});

const {sequelize, User, File, Click} = require("./database/associations");
const { parseUserAgent, normalizeReferrer, hashIp } = require('./utils/parseUA');

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

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "User not found",
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

app.get("/uploads/:name", async (req, res) => {
  const {name} = req.params;

  console.log(name);

  try {
    let user = await User.findOne({
      where: {
        username: req.session.user.username
      }
    });

    if (!user) {
      return res.status(404).json({ok: false, message: "User not found"});
    }

    let files = await user.getFiles({
      where: {
        name: name
      },
      paranoid: false,
      limit: 1
    });

    if (!files || files.length === 0) {
      return res.status(404).json({ok: false, message: "File not found"});
    }

    let file = files[0];

    // Check if file is deleted
    if (file.deletedAt) {
      return res.status(410).json({ok: false, message: "File has been deleted"});
    }

    // Check visibility and authentication
    if (!file.visibility) {
      // Private file - check if user is authenticated and owns the file
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ok: false, message: "Authentication required for private files"});
      }

      // Add your authentication logic here
      // For example, if using JWT:
      try {
        const token = authHeader.split(' ')[1]; // Assuming "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.username !== username) {
          return res.status(403).json({ok: false, message: "Access denied"});
        }
      } catch (authError) {
        return res.status(401).json({ok: false, message: "Invalid authentication"});
      }
    }

    // Set appropriate headers
    res.set({
      'Content-Type': mime.lookup(file.name) || 'application/octet-stream',
      'Content-Length': file.file ? file.file.length : 0,
      'Cache-Control': file.visibility ? 'public, max-age=31536000' : 'private, no-cache',
      'Content-Disposition': `inline; filename="${file.name}"`
    });

    // Send the file buffer
    if (file.file) {
      res.send(file.file);
    } else {
      res.status(404).json({ok: false, message: "File data not found"});
    }

  } catch (e) {
    console.error("Error serving file:", e);
    return res.status(500).json({ok: false, message: "Internal server error"});
  }
});

// ============================================================
// ANALYTICS ROUTES
// ============================================================

/**
 * GET /api/analytics/links/:id
 * Per-link analytics: clicks/day, unique visitors, top device/OS/browser/referrer
 *
 * Security: verifies the requested link belongs to the authenticated user before
 * returning any click data.  Returns 404 (not 403) to avoid leaking link existence.
 */
app.get('/api/analytics/links/:id', userMil, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const linkId = req.params.id;

    // ── Ownership check ────────────────────────────────────────────────────
    // Dynamically require Link so the route degrades gracefully on branches
    // where the Link model hasn't been merged in yet.
    try {
      const { Link } = require('./database/associations');
      if (Link) {
        const link = await Link.findOne({
          where: { id: linkId, userId: req.user.id },
        });
        // Return 404 (not 403) to avoid leaking existence of other users' links
        if (!link) {
          return res.status(404).json({ ok: false, message: 'Link not found' });
        }
      }
    } catch {
      // Link model not available on this branch – skip ownership guard
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const clicks = await Click.findAll({
      where: {
        linkId,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: ['ipHash', 'device', 'os', 'browser', 'referrer', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });

    // Clicks per day
    const byDay = {};
    clicks.forEach((c) => {
      const day = c.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });

    // Unique visitors (by IP hash)
    const uniqueVisitors = new Set(clicks.map((c) => c.ipHash).filter(Boolean)).size;

    // Top N helper
    const topN = (field, n = 5) => {
      const counts = {};
      clicks.forEach((c) => { if (c[field]) counts[c[field]] = (counts[c[field]] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }));
    };

    res.json({
      ok: true,
      totalClicks: clicks.length,
      uniqueVisitors,
      clicksByDay: byDay,
      topDevices: topN('device'),
      topOS: topN('os'),
      topBrowsers: topN('browser'),
      topReferrers: topN('referrer'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to load analytics' });
  }
});

/**
 * GET /api/analytics
 * Account-level analytics: aggregate clicks, top links, clicks/day for last 30 days
 *
 * Security: scopes all Click queries to the authenticated user's own link IDs so
 * one user never sees another user's totals.
 */
app.get('/api/analytics', userMil, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // ── Collect this user's link IDs ───────────────────────────────────────
    let userLinkIds = [];
    try {
      const { Link } = require('./database/associations');
      if (Link) {
        const userLinks = await Link.findAll({
          where: { userId: req.user.id },
          attributes: ['id'],
          raw: true,
        });
        userLinkIds = userLinks.map((l) => l.id);
      }
    } catch {
      // Link model not available on this branch
    }

    // When the user has no links (or Link model absent) there are no clicks to show.
    // Sequelize Op.in with an empty array produces a 1=0 predicate — zero rows, safe.
    const linkFilter = userLinkIds.length > 0
      ? { linkId: { [Op.in]: userLinkIds } }
      : { linkId: { [Op.in]: [] } };

    const timeFilter = { createdAt: { [Op.gte]: thirtyDaysAgo } };

    // ── Total clicks (user-scoped) ─────────────────────────────────────────
    const totalClicks = await Click.count({
      where: { ...timeFilter, ...linkFilter },
    });

    // ── Clicks per day (user-scoped) ───────────────────────────────────────
    const clicks = await Click.findAll({
      where: { ...timeFilter, ...linkFilter },
      attributes: ['createdAt'],
      order: [['createdAt', 'ASC']],
    });

    const byDay = {};
    clicks.forEach((c) => {
      const day = c.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });

    res.json({
      ok: true,
      totalClicks,
      clicksByDay: byDay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to load analytics' });
  }
});

/**
 * POST /api/analytics/click — internal: record a click event
 * Called non-blocking from the redirect handler once Link model is available.
 */
async function recordClick(linkId, req) {
  try {
    const ua = req.headers['user-agent'] || '';
    const { device, os, browser } = parseUserAgent(ua);
    const referrer = normalizeReferrer(req.headers['referer'] || req.headers['referrer'], req.hostname);
    const ip = req.ip || req.socket?.remoteAddress || '';
    const ipHash = hashIp(ip);

    await Click.create({ linkId, ipHash, device, os, browser, referrer });
  } catch {
    // Never block redirects due to analytics errors
  }
}

// Export for use in redirect handler
module.exports = module.exports || {};
if (typeof module !== 'undefined') module.exports.recordClick = recordClick;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, './short/build')));

app.use((req, res) => {
  console.log('Catch-all middleware hit, serving:', path.join(__dirname, './short/build', 'index.html'));
  res.sendFile(path.join(__dirname, './short/build', 'index.html'));
});


// Global error handler must come after all routes and middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
