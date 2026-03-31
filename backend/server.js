const express = require("express");
const multer = require("multer");
const cors = require("cors");
const XLSX = require("xlsx");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    //validate
    if (!req.file) {
      return res.status(400).json({ error: "File required" });
    }
    const file = XLSX.readFile(req.file.path);
    const sheet = file.Sheets[file.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Assume column name is 'url'
    const urls = data.map((row) => row.url);

    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: "File processing failed" });
  }
});


app.get("/check-frame", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "URL required" });

  try {
    // Make a lightweight HEAD request to grab headers
    const response = await fetch(targetUrl, { method: "HEAD" });
    const xFrameOptions = response.headers.get("x-frame-options");
    const csp = response.headers.get("content-security-policy");

    let blocked = false;

    // Check common headers that block iframes
    if (xFrameOptions && (xFrameOptions.toUpperCase() === "DENY" || xFrameOptions.toUpperCase() === "SAMEORIGIN")) {
      blocked = true;
    }
    if (csp && csp.toLowerCase().includes("frame-ancestors")) {
      blocked = true;
    }

    res.json({ blocked });
  } catch (err) {
    // If the fetch fails entirely (e.g., severe CORS restrictions or invalid URL), assume blocked
    res.json({ blocked: true });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));
