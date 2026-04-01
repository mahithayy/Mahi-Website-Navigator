import { useState } from "react";
import FileUpload from "../components/FileUpload";
import Navigator from "../components/Navigator";

export default function Home() {
  const [urls, setUrls] = useState([]);

  return (
    <>
      <div className="navbar">
        <h1>🌐 Mahitha's Website Navigator</h1>
      </div>

      <FileUpload setUrls={setUrls} />

      {urls.length > 0 && <Navigator urls={urls} />}
    </>
  );
}