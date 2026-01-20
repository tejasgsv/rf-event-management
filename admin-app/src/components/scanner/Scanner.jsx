import React, { useState } from "react";
import adminApiClient from "../../utils/adminApiClient";
import "./Scanner.css";

const AdminScanner = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await adminApiClient.post("/scan", {
        registrationId: input.trim(),
      });

      setResult(res.data);
    } catch {
      setResult({
        allowed: false,
        reason: "SERVER_ERROR",
      });
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="scanner-page">
      <h1>📷 Admin QR Scanner</h1>

      <div className="scanner-box">
        <input
          type="text"
          placeholder="Scan / Paste Registration ID"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
        />
        <button onClick={handleScan} disabled={loading}>
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {result && (
        <div
          className={`scan-result ${
            result.allowed ? "success" : "error"
          }`}
        >
          {result.allowed ? (
            <>
              <h2>✅ ENTRY ALLOWED</h2>
              <p><strong>Session:</strong> {result.data.sessionTitle}</p>
              <p><strong>Event:</strong> {result.data.eventtitle}</p>
              <p><strong>Email:</strong> {result.data.email}</p>
            </>
          ) : (
            <>
              <h2>❌ ENTRY DENIED</h2>
              <p>
                Reason:{" "}
                {result.reason === "NOT_CONFIRMED"
                  ? "Not Confirmed"
                  : result.reason === "INVALID_QR"
                  ? "Invalid QR"
                  : "Session Inactive / Error"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminScanner;
