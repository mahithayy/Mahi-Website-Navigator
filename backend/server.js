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
    const headers = {
      // Mimic a real browser to bypass basic bot-protection
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    // 1. Try a lightweight HEAD request first
    let response = await fetch(targetUrl, { method: "HEAD", headers });

    // 2. If the server rejects HEAD requests (e.g., 405 or 403), fallback to a GET request
    if (!response.ok) {
      response = await fetch(targetUrl, { method: "GET", headers });
    }

    const xFrameOptions = response.headers.get("x-frame-options");
    const csp = response.headers.get("content-security-policy");

    let blocked = false;

    // 3. Check common headers that block iframes
    if (xFrameOptions && (xFrameOptions.toUpperCase() === "DENY" || xFrameOptions.toUpperCase() === "SAMEORIGIN")) {
      blocked = true;
    }

    if (csp && csp.toLowerCase().includes("frame-ancestors")) {
      blocked = true;
    }

    // Optional: Severe error statuses (like 403/401) from security firewalls usually mean blocked
    if (!response.ok && !xFrameOptions && !csp) {
      if (response.status === 403 || response.status === 401) {
         blocked = true;
      }
    }

    // Return a richer object with status and offline flags
    res.json({
        blocked,
        offline: false,
        status: response.status,
        ok: response.ok
    });

  } catch (err) {
    // If the fetch fails entirely (e.g., DNS fail, invalid URL, domain dead)
    res.json({ blocked: false, offline: true });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));