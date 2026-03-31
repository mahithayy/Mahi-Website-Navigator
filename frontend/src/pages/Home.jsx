import { useState } from "react";
import FileUpload from "../components/FileUpload";
import Navigator from "../components/Navigator";

export default function Home() {
  const [urls, setUrls] = useState([]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🌐 Website Navigator</h1>

      <FileUpload setUrls={setUrls} />

      {/* Show only when URLs exist */}
      {urls.length > 0 && <Navigator urls={urls} />}
    </div>
  );
}