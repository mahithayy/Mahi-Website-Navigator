import { useState, useEffect } from "react";
import { checkIframeAllowed } from "../api/api"; // Import the new API function

export default function Navigator({ urls }) {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  useEffect(() => {
    const verifyUrl = async () => {
      setLoading(true);
      setIframeBlocked(false);

      const currentUrl = urls[index];

      // Ask backend if this URL blocks iframes
      const isBlocked = await checkIframeAllowed(currentUrl);

      if (isBlocked) {
        setIframeBlocked(true);
        setLoading(false); // Stop loading since we aren't going to show the iframe
      } else {
        setIframeBlocked(false);
        // iframe onLoad will handle setting loading to false
      }
    };

    if (urls && urls.length > 0) {
      verifyUrl();
    }
  }, [index, urls]);

  if (!urls || urls.length === 0) return <p>No URLs loaded</p>;

  const next = () => {
    if (index < urls.length - 1) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Index */}
      <p>
        <strong>{index + 1}</strong> / {urls.length}
      </p>

      {/* Buttons */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={prev}
          disabled={index === 0}
          title="Go to previous website"
        >
          ⬅ Previous
        </button>

        <button
          onClick={next}
          disabled={index === urls.length - 1}
          title="Go to next website"
          style={{ marginLeft: "10px" }}
        >
          Next ➡
        </button>
      </div>

      {/* Open in new tab */}
      <div style={{ marginBottom: "10px" }}>
        <a href={urls[index]} target="_blank" rel="noreferrer">
          🔗 Open in new tab
        </a>
      </div>

      {/* Loading */}
      {loading && <p>Loading website...</p>}

      {/* Blocked message */}
      {iframeBlocked ? (
        <div style={{ padding: "40px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f8d7da", color: "#721c24" }}>
          <p><strong>Security Restriction:</strong> This website cannot be displayed inside another webpage.</p>
          <p>Please use the "Open in new tab" link above to view it.</p>
        </div>
      ) : (
        /* Iframe - only renders if NOT blocked */
        <iframe
          src={urls[index]}
          title="website"
          width="100%"
          height="500px"
          onLoad={() => setLoading(false)}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: loading ? "none" : "block" // Hide iframe until it finishes loading
          }}
        />
      )}
    </div>
  );
}