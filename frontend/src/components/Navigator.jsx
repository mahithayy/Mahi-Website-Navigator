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
    <div className="card-container">
      <p className="counter-text">
        Showing website <strong>{index + 1}</strong> of {urls.length}
      </p>

      <div className="nav-buttons">
        <button onClick={prev} disabled={index === 0}>
          ⬅ Previous
        </button>
        <button onClick={next} disabled={index === urls.length - 1}>
          Next ➡
        </button>
      </div>

      <a className="external-link" href={urls[index]} target="_blank" rel="noreferrer">
        🔗 Open current website in new tab
      </a>

      <div className="iframe-wrapper">
        {loading && !mixedContent && !offline && !iframeBlocked && (
          <div className="status-message status-loading">Loading website...</div>
        )}

        {timeoutWarning && loading && (
          <div className="status-message status-warning">
            This site is taking a long time to respond.
          </div>
        )}

        {badStatus && !iframeBlocked && !offline && !mixedContent && (
          <div className="status-message status-warning">
            HTTP {badStatus} — page may look broken
          </div>
        )}

        {mixedContent ? (
          <div className="status-message status-error">Mixed Content Error: Cannot load HTTP site on HTTPS</div>
        ) : offline ? (
          <div className="status-message status-error">Site Unreachable or Offline</div>
        ) : iframeBlocked ? (
          <div className="status-message status-error">Security Restriction: This site blocks iframes</div>
        ) : (
          <iframe
            src={urls[index]}
            title="website"
            onLoad={handleIframeLoad}
            style={{ display: loading ? "none" : "block" }}
          />
        )}
      </div>
    </div>
  );
}