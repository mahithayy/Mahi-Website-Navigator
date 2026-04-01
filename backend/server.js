const express = require("express");
const multer = require("multer");
const cors = require("cors");
const XLSX = require("xlsx");
const fs = require("fs");

// ensure fetch works in all Node versions
const fetch = global.fetch || require("node-fetch");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
  // Check for file before entering the try-catch block
  if (!req.file) {
    return res.status(400).json({ error: "File required" });
  }

  try {
    const file = XLSX.readFile(req.file.path);
    const sheet = file.Sheets[file.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // handle different column names + remove invalid values
    const urls = data
  .map((row) => {
    // normalize keys (remove spaces + lowercase)
    const normalizedRow = {};

    Object.keys(row).forEach((key) => {
      const cleanKey = key.trim().toLowerCase();
      normalizedRow[cleanKey] = row[key];
    });

    return normalizedRow.url || normalizedRow.link;
  })
  .filter((url) => typeof url === "string" && url.trim() !== "");
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: "File processing failed" });
  } finally {
    //logic for deleting the uploaded file after processing
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete temporary file:", err);
        } else {
          console.log(`Successfully deleted temp file: ${req.file.path}`);
        }
      });
    }
  }
});

app.get("/check-frame", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "URL required" });
  }

  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    let response = await fetch(targetUrl, { method: "HEAD", headers });

    if (!response.ok) {
      response = await fetch(targetUrl, { method: "GET", headers });
    }

    const xFrameOptions = response.headers.get("x-frame-options");
    const csp = response.headers.get("content-security-policy");

    let blocked = false;

    if (
      xFrameOptions &&
      (xFrameOptions.toUpperCase() === "DENY" ||
        xFrameOptions.toUpperCase() === "SAMEORIGIN")
    ) {
      blocked = true;
    }

    if (csp && csp.toLowerCase().includes("frame-ancestors")) {
      blocked = true;
    }

    if (!response.ok && !xFrameOptions && !csp) {
      if (response.status === 403 || response.status === 401) {
        blocked = true;
      }
    }

    res.json({
      blocked,
      offline: false,
      status: response.status,
      ok: response.ok,
    });
  } catch (err) {
    res.json({ blocked: false, offline: true });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));