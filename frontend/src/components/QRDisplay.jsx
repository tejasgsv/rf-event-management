import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/QRDisplay.css";

const QRDisplay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrationId } = useParams();

  // 1️⃣ Prefer cached data (fast)
  const [data, setData] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  // 2️⃣ Fallback: fetch from backend if refreshed
  useEffect(() => {
    if (data || !registrationId) return;

    const fetchQR = async () => {
      try {
        const res = await apiClient.get(
          `/registrations/${registrationId}`
        );
        setData(res.data?.data || null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load QR code."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [data, registrationId]);

  /* ================= LOADING ================= */

  if (loading) {
    return <div className="qr-page">Loading QR…</div>;
  }

  /* ================= ERROR ================= */

  if (error || !data || !data.qrCode) {
    return (
      <div className="qr-page error">
        <h2>QR Not Available</h2>
        <p>
          {error ||
            "QR code not found. Please check your registration from My Schedule."}
        </p>
        <button onClick={() => navigate("/my-schedule")}>
          Go to My Schedule
        </button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="qr-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>🎟 Your Entry QR</h1>

      <img
        src={data.qrCode}
        alt="QR Code"
        className="qr-image"
      />

      <div className="qr-info">
        <p>
          <strong>Session:</strong>{" "}
          {data.sessionTitle || "Session"}
        </p>

        <p>
          <strong>Event:</strong>{" "}
          {data.eventtitle || "Event"}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={`status ${data.status.toLowerCase()}`}>
            {data.status}
          </span>
        </p>
      </div>

      <p className="qr-note">
        Please present this QR code at the venue entry.
      </p>
    </div>
  );
};

export default QRDisplay;
