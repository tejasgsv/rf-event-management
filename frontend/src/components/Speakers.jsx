import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/Speakers.css";

const Speakers = () => {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get("/speakers");
      const data = res.data?.data || res.data || [];
      setSpeakers(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load speakers';
      setError(message);
      setSpeakers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="speakers-page loading">Loading speakers…</div>;
  }

  if (error) {
    return (
      <div className="speakers-page loading">
        <p>{error}</p>
        <button className="back-btn" onClick={fetchSpeakers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="speakers-page">
      {/* ===== HEADER ===== */}
      <div className="speakers-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Speakers</h1>
        <p className="subtitle">
          Meet the experts & voices behind the sessions
        </p>
      </div>

      {/* ===== SPEAKER LIST ===== */}
      <div className="speakers-grid">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="speaker-card"
            onClick={() => navigate(`/speaker/${speaker.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {speaker.photo ? (
              <img src={speaker.photo} alt={speaker.name} className="speaker-photo" />
            ) : (
              <div className="speaker-avatar">
                {speaker.name.charAt(0)}
              </div>
            )}

            <div className="speaker-info">
              <h3>{speaker.name}</h3>
              <p className="designation">{speaker.designation}</p>
              <p className="organization">{speaker.organization}</p>

              {speaker.topic && (
                <p className="topic">
                  🎤 <strong>{speaker.topic}</strong>
                </p>
              )}
              
              <p className="view-link">View Profile →</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Speakers;
