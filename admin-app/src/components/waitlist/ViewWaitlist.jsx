import React, { useEffect, useMemo, useState } from "react";
import adminApiClient from "../../utils/adminApiClient";
import "./ViewWaitlist.css";

const ViewWaitlist = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [masterclassMap, setMasterclassMap] = useState({});
  const [selectedMasterclass, setSelectedMasterclass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminApiClient.get("/waitlist");
      const list = res.data?.data || [];
      setWaitlist(list);

      const uniqueIds = Array.from(new Set(list.map((item) => item.masterclassId)));
      await fetchMasterclasses(uniqueIds);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load waitlist");
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterclasses = async (ids) => {
    if (!ids.length) return;

    const results = await Promise.allSettled(
      ids.map((id) => adminApiClient.get(`/sessions/${id}`))
    );

    const map = {};
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value?.data?.data || result.value?.data;
        if (data?.id) {
          map[data.id] = data.title || `Session ${data.id}`;
        }
      }
    });

    setMasterclassMap(map);
  };

  const handlePromoteFromWaitlist = async (waitlistId) => {
    if (!window.confirm("Promote this person from waitlist?")) return;

    try {
      await adminApiClient.post(`/waitlist/${waitlistId}/promote`);
      fetchWaitlist();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote from waitlist");
    }
  };

  const handleRemoveFromWaitlist = async (waitlistId) => {
    if (!window.confirm("Remove this person from waitlist?")) return;

    try {
      await adminApiClient.delete(`/waitlist/${waitlistId}`);
      fetchWaitlist();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove from waitlist");
    }
  };

  const filtered = useMemo(() => {
    if (!selectedMasterclass) return waitlist;
    return waitlist.filter(
      (item) => String(item.masterclassId) === String(selectedMasterclass)
    );
  }, [selectedMasterclass, waitlist]);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Waitlist</h1>
          <p className="subtitle">Manage waitlisted attendees by session</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchWaitlist}>
          Refresh
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="filters-row">
        <label>Filter by Session</label>
        <select
          value={selectedMasterclass}
          onChange={(e) => setSelectedMasterclass(e.target.value)}
        >
          <option value="">All Sessions</option>
          {Object.entries(masterclassMap).map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-page">Loading waitlist…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No waitlist entries found</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Session</th>
                <th>Position</th>
                <th>Added</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{masterclassMap[item.masterclassId] || `Session ${item.masterclassId}`}</td>
                  <td>#{item.position}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      className="btn small primary"
                      onClick={() => handlePromoteFromWaitlist(item.id)}
                    >
                      Promote
                    </button>
                    <button
                      className="btn small danger"
                      onClick={() => handleRemoveFromWaitlist(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewWaitlist;
