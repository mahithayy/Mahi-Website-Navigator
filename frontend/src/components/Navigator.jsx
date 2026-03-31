import { useState, useEffect, useRef } from "react";
import { checkIframeAllowed } from "../api/api";

export default function Navigator({ urls }) {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [offline, setOffline] = useState(false);
  const [mixedContent, setMixedContent] = useState(false);
  const [badStatus, setBadStatus] = useState(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const verifyUrl = async () => {
      setLoading(true);
      setIframeBlocked(false);
      setOffline(false);
      setMixedContent(false);
      setBadStatus(null);
      setTimeoutWarning(false);

      if (timerRef.current) clearTimeout(timerRef.current);

      const currentUrl = urls[index];

      //  prevent crash if undefined
      if (!currentUrl) return;

      // normalize URL
      const normalizedUrl = currentUrl.trim().toLowerCase();

      // Mixed content check
      if (
        window.location.protocol === "https:" &&
        normalizedUrl.startsWith("http://")
      ) {
        setMixedContent(true);
        setLoading(false);
        return;
      }

      try {
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

        if (!data.ok && data.status) {
          setBadStatus(data.status);
        }

        timerRef.current = setTimeout(() => {
          setTimeoutWarning(true);
        }, 10000);
      } catch (err) {
        // handle API failure
        setOffline(true);
        setLoading(false);
        return;
      }
    };

    if (urls && urls.length > 0) {
      verifyUrl();
    }

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

  const handleIframeLoad = () => {
    setLoading(false);
    setTimeoutWarning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <p>
        <strong>{index + 1}</strong> / {urls.length}
      </p>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={prev} disabled={index === 0}>
          ⬅ Previous
        </button>
        <button
          onClick={next}
          disabled={index === urls.length - 1}
          style={{ marginLeft: "10px" }}
        >
          Next ➡
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <a href={urls[index]} target="_blank" rel="noreferrer">
          🔗 Open in new tab
        </a>
      </div>

      {loading && !mixedContent && !offline && !iframeBlocked && (
        <p>Loading website...</p>
      )}

      {timeoutWarning && loading && (
        <p style={{ color: "#d39e00" }}>
          This site is taking a long time to respond.
        </p>
      )}

      {badStatus && !iframeBlocked && !offline && !mixedContent && (
        <div style={{ backgroundColor: "#fff3cd", padding: "10px" }}>
          HTTP {badStatus} — page may look broken
        </div>
      )}

      {mixedContent ? (
        <div>
          <p>Mixed Content Error</p>
        </div>
      ) : offline ? (
        <div>
          <p>Site Unreachable</p>
        </div>
      ) : iframeBlocked ? (
        <div>
          <p>Security Restriction</p>
        </div>
      ) : (
        <iframe
          src={urls[index]}
          title="website"
          width="100%"
          height="500px"
          onLoad={handleIframeLoad}
          style={{
            display: loading ? "none" : "block",
          }}
        />
      )}
    </div>
  );
}