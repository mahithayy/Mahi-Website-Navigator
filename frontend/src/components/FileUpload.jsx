import { useState } from "react";
import { uploadFile } from "../api/api";

export default function FileUpload({ setUrls }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await uploadFile(file);

      if (!data.urls || data.urls.length === 0) {
        setError("No valid URLs found in file");
        return;
      }

      setUrls(data.urls);
    } catch (err) {
      // show backend error if available
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {loading && <p>Uploading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}