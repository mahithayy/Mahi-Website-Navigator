import { useState } from "react";
import { uploadFile } from "../api/api";

// export default function FileUpload({ setUrls }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];

//     if (!file) {
//       setError("Please select a file");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const data = await uploadFile(file);

//       if (!data.urls || data.urls.length === 0) {
//         setError("No valid URLs found in file");
//         return;
//       }

//       setUrls(data.urls);
//     } catch (err) {
//       // show backend error if available
//       setError(err.response?.data?.error || "Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };
// }


export default function FileUpload({ setUrls }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

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

  return (
    <div className="card-container file-upload-wrapper">


      <p className="upload-title">Upload your file</p>
      <p className="upload-subtitle">
        Supported formats: <strong>.xlsx, .csv</strong>
      </p>

      <input type="file" onChange={handleUpload} />

      {/* Selected file preview */}
      {fileName && (
        <p className="file-name">📄 {fileName}</p>
      )}

      {loading && <p className="status-loading">Uploading...</p>}
      {error && <p className="status-error">{error}</p>}
    </div>
  );
}
