import { useState, useRef } from "react";
import { uploadFile } from "../api/api";




export default function FileUpload({ setUrls }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
const fileInputRef = useRef(null);//for clearing input
  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setError("Please select a file");
      return;
    }

    setFileName(file.name);

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
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };
  //logic for "remove" button
const handleRemove = () => {
    setFileName("");
    setUrls([]); // clear navigator
    setError("");

    // reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="card-container file-upload-wrapper">


      <p className="upload-title">Upload your file</p>
      <p className="upload-subtitle">
        Supported formats: <strong>.xlsx, .csv</strong>
      </p>
<p className="upload-subtitle">Note: Column header in the uploaded sheet should be "URL"</p>
      <input
        type="file"
        onChange={handleUpload}
        ref={fileInputRef}
        disabled={!!fileName}
        className={fileName ? "file-input disabled" : "file-input"}
      />

      {/* Selected file preview */}
      {fileName && (
        <div><p style={{ color: "#16a34a", fontWeight: "600" }}>
     File selected successfully
  </p>
        <p className="file-name">📄 {fileName}</p></div>
      )}
{/*  REMOVE BUTTON */}
      {fileName && (
        <button
          onClick={handleRemove}
          style={{
            background: "#ef4444",
            marginTop: "10px"
          }}
        >
           Remove File
        </button>
      )}
      {loading && <p className="status-loading">Uploading...</p>}
      {error && <p className="status-error">{error}</p>}
    </div>
  );
}
