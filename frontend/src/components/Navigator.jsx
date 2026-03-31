import { useState, useEffect, useRef } from "react";
import { checkIframeAllowed } from "../api/api";

export default function Navigator({ urls }) {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Specific Error States
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [offline, setOffline] = useState(false);
  const [mixedContent, setMixedContent] = useState(false);
  const [badStatus, setBadStatus] = useState(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  // Use a ref to keep track of the loading timer so we can clear it safely
  const timerRef = useRef(null);

  useEffect(() => {
    const verifyUrl = async () => {
      // 1. Reset all states before checking the new URL
      setLoading(true);
      setIframeBlocked(false);
      setOffline(false);
      setMixedContent(false);
      setBadStatus(null);
      setTimeoutWarning(false);
      if (timerRef.current) clearTimeout(timerRef.current);

      const currentUrl = urls[index];

      // 2. Check for Mixed Content before making network requests
      // If we are on HTTPS, browsers will refuse to load HTTP iframes
      if (window.location.protocol === 'https:' && currentUrl.startsWith('http://')) {
        setMixedContent(true);
        setLoading(false);
        return;
      }

      // 3. Ask backend about headers and status
      const data = await checkIframeAllowed(currentUrl);

      if (data.offline) {
        setOffline(true);
        setLoading(false);
        return;
      }

      if (data.blocked) {
        setIframeBlocked(true);
        setLoading(false);
        return;
      }

      // 4. If not blocked, but it's a 404/500, we'll warn the user but still try to load it
      if (!data.ok && data.status) {
         setBadStatus(data.status);
      }

      // 5. Start a 10-second timer. If the iframe onLoad hasn't fired by then, show a warning.
      timerRef.current = setTimeout(() => {
        setTimeoutWarning(true);
      }, 10000);
    };

    if (urls && urls.length > 0) {
      verifyUrl();
    }

    // Cleanup timer if component unmounts or URL changes
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, urls]);

  if (!urls || urls.length === 0) return <p>No URLs loaded</p>;

  const next = () => {
    if (index < urls.length - 1) setIndex(index + 1);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  // Called when the iframe successfully finishes loading
  const handleIframeLoad = () => {
    setLoading(false);
    setTimeoutWarning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Index */}
      <p>
        <strong>{index + 1}</strong> / {urls.length}
      </p>

      {/* Buttons */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={prev} disabled={index === 0} title="Go to previous website">
          ⬅ Previous
        </button>

        <button onClick={next} disabled={index === urls.length - 1} title="Go to next website" style={{ marginLeft: "10px" }}>
          Next ➡
        </button>
      </div>

      {/* Open in new tab */}
      <div style={{ marginBottom: "10px" }}>
        <a href={urls[index]} target="_blank" rel="noreferrer">
          🔗 Open in new tab
        </a>
      </div>

      {/* Loading & Status Messages */}
      {loading && !mixedContent && !offline && !iframeBlocked && <p>Loading website...</p>}

      {timeoutWarning && loading && (
          <p style={{ color: "#d39e00" }}>This site is taking a long time to respond. It might be silently blocking the connection.</p>
      )}

      {badStatus && !iframeBlocked && !offline && !mixedContent && (
        <div style={{ padding: "15px", marginBottom: "10px", border: "1px solid #ffeeba", borderRadius: "8px", backgroundColor: "#fff3cd", color: "#856404" }}>
          <p style={{ margin: 0 }}><strong>Note:</strong> The server returned an HTTP {badStatus} error. The page inside the frame below might look broken or missing.</p>
        </div>
      )}

      {/* Main Content Area: Renders the appropriate error box OR the iframe */}
      {mixedContent ? (
        <div style={{ padding: "40px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#fff3cd", color: "#856404" }}>
          <p><strong>Mixed Content Error:</strong> Cannot load an unsecure HTTP site inside a secure HTTPS connection.</p>
          <p>Please use the "Open in new tab" link above.</p>
        </div>
      ) : offline ? (
        <div style={{ padding: "40px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#e2e3e5", color: "#383d41" }}>
          <p><strong>Site Unreachable:</strong> The website could not be reached or the domain does not exist.</p>
          <p>Check the URL or try opening it in a new tab.</p>
        </div>
      ) : iframeBlocked ? (
        <div style={{ padding: "40px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f8d7da", color: "#721c24" }}>
          <p><strong>Security Restriction:</strong> This website cannot be displayed inside another webpage.</p>
          <p>Please use the "Open in new tab" link above to view it.</p>
        </div>
      ) : (
        /* Iframe - only renders if NOT blocked, offline, or mixed-content */
        <iframe
          src={urls[index]}
          title="website"
          width="100%"
          height="500px"
          onLoad={handleIframeLoad}
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