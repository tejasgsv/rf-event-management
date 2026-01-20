import React, { useEffect, useState } from "react";
import adminApiClient from "../../utils/adminApiClient";
import { isValidEmail } from "../../utils/validation";
import "./AdminSpeakers.css";

const initialForm = {
  name: "",
  title: "",
  designation: "",
  organization: "",
  bio: "",
  photo: "",
  email: "",
  linkedin: "",
  twitter: "",
};

const AdminSpeakers = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApiClient.get("/speakers");
      setSpeakers(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load speakers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editingId) {
      setPendingPhotoFile(file);
      setError("");
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, photo: previewUrl }));
      return;
    }

    try {
      setUploadingPhoto(true);
      setError("");

      const formData = new FormData();
      formData.append("photo", file);

      const res = await adminApiClient.post(`/speakers/${editingId}/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.data?.url || "";
      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, photo: uploadedUrl }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, photo: "" }));
    setPendingPhotoFile(null);
  };

  const startEdit = (speaker) => {
    setEditingId(speaker.id);
    setForm({
      name: speaker.name || "",
      title: speaker.title || "",
      designation: speaker.designation || "",
      organization: speaker.organization || "",
      bio: speaker.bio || "",
      photo: speaker.photo || "",
      email: speaker.email || "",
      linkedin: speaker.linkedin || "",
      twitter: speaker.twitter || "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setPendingPhotoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Speaker name is required");
      return;
    }

    if (form.email && !isValidEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await adminApiClient.put(`/speakers/${editingId}`, form);
      } else {
        const res = await adminApiClient.post("/speakers", form);
        const createdId = res.data?.data?.id;

        if (createdId && pendingPhotoFile) {
          const formData = new FormData();
          formData.append("photo", pendingPhotoFile);

          await adminApiClient.post(`/speakers/${createdId}/photo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      resetForm();
      fetchSpeakers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save speaker");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (speakerId) => {
    if (!window.confirm("Delete this speaker?")) return;

    try {
      await adminApiClient.delete(`/speakers/${speakerId}`);
      setSpeakers((prev) => prev.filter((sp) => sp.id !== speakerId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete speaker");
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Speakers</h1>
          <p className="subtitle">Create and manage speaker profiles</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchSpeakers}>
          Refresh
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="speaker-layout">
        <form className="speaker-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Speaker" : "Create Speaker"}</h3>
          <p className="form-subtitle">Add name, photo, title, and bio for speakers.</p>

          <label>Name *</label>
          <input name="name" value={form.name} onChange={handleChange} />

          <div className="form-row">
            <div>
              <label>Designation</label>
              <input name="designation" value={form.designation} onChange={handleChange} />
            </div>
            <div>
              <label>Organization</label>
              <input name="organization" value={form.organization} onChange={handleChange} />
            </div>
          </div>

          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />

          <label>Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={saving || uploadingPhoto}
          />
          <span className="field-hint">
            Upload a local image (JPG/PNG/WebP). Max 5 MB.
            {editingId ? "" : " Photo will be uploaded after creating the speaker."}
          </span>
          {form.photo && (
            <div className="photo-preview">
              <img src={form.photo} alt="Speaker preview" />
              <button
                type="button"
                className="btn small secondary"
                onClick={removePhoto}
              >
                Remove
              </button>
            </div>
          )}
          {uploadingPhoto && <div className="uploading-note">Uploading photo…</div>}

          <label>LinkedIn URL</label>
          <input name="linkedin" value={form.linkedin} onChange={handleChange} />

          <label>Twitter/X URL</label>
          <input name="twitter" value={form.twitter} onChange={handleChange} />

          <label>Bio</label>
          <textarea name="bio" rows="4" value={form.bio} onChange={handleChange} />

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Speaker" : "Create Speaker"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="speaker-list">
          {loading ? (
            <div className="admin-page">Loading speakers…</div>
          ) : speakers.length === 0 ? (
            <div className="empty-state">No speakers found</div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Organization</th>
                    <th>Email</th>
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {speakers.map((sp) => (
                    <tr key={sp.id}>
                      <td>
                        {sp.photo ? (
                          <img className="photo-thumb" src={sp.photo} alt={sp.name} />
                        ) : (
                          <div className="photo-thumb placeholder">{sp.name?.charAt(0) || "?"}</div>
                        )}
                      </td>
                      <td>{sp.name}</td>
                      <td>{sp.designation || "—"}</td>
                      <td>{sp.organization || "—"}</td>
                      <td>{sp.email || "—"}</td>
                      <td className="actions-cell">
                        <button className="btn small secondary" onClick={() => startEdit(sp)}>
                          Edit
                        </button>
                        <button className="btn small danger" onClick={() => handleDelete(sp.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSpeakers;
