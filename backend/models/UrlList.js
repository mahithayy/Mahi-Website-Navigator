const mongoose = require("mongoose");

// Create the UrlList schema
const urlListSchema = new mongoose.Schema({
  urls: {
    type: [String], // Array of strings
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now, // Defaults to the exact moment it is saved
  },
});

// Export the model
module.exports = mongoose.model("UrlList", urlListSchema);