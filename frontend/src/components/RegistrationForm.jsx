import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import apiClient from "../utils/apiClient";
import {
  isValidEmail,
  isValidMobile,
  isValidName,
  isValidPostal,
  sanitizeLettersSpaces,
  sanitizePostal,
  sanitizeMobile
} from "../utils/validationUtils";
import "../styles/RegistrationForm.css";

/**
 * RegistrationForm Component
 * Collects user details and registers them for a masterclass
 * Generates QR code and sends email confirmation
 */
const RegistrationForm = () => {
  const { masterclassId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [masterclass, setMasterclass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    mobile: "",
    organization: "",
    designation: "",
    country: "India",
    postalCode: "",
    accessibilityNeeds: ""
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Fetch session details (optional)
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const stateSession = location.state?.session;
        if (stateSession) {
          setMasterclass({
            id: stateSession.session_id || stateSession.id,
            eventId: stateSession.eventId,
            title: stateSession.title,
            startTime: stateSession.start_time,
            endTime: stateSession.end_time,
            location: stateSession.hall,
          });
          return;
        }

        const eventId = searchParams.get("eventId");
        if (!eventId) return;

        const response = await apiClient.get(`/sessions/event/${eventId}`);
        const list = response.data?.data || [];
        const session = list.find((item) => String(item.id) === String(masterclassId));

        if (session) {
          setMasterclass(session);
        } else {
          setError("Session not found");
        }
      } catch (err) {
        console.error('❌ Error fetching masterclass:', err);
        setError('Failed to load masterclass details');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [masterclassId, location.state, searchParams]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;
    if (name === "name" || name === "surname") {
      nextValue = sanitizeLettersSpaces(value);
    }
    if (name === "postalCode") {
      nextValue = sanitizePostal(value);
    }
    if (name === "mobile") {
      nextValue = sanitizeMobile(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.surname.trim()) errors.push("Surname is required");
    if (!formData.organization.trim()) errors.push("Organization is required");
    if (!formData.designation.trim()) errors.push("Designation is required");
    if (!isValidName(formData.name)) errors.push("Name must contain letters and spaces only");
    if (!isValidName(formData.surname)) errors.push("Surname must contain letters and spaces only");
    if (!isValidEmail(formData.email)) errors.push("Valid email is required");
    if (!isValidMobile(formData.mobile)) errors.push("Valid mobile number is required");
    if (!formData.country.trim()) errors.push("Country is required");
    if (!formData.postalCode.trim()) errors.push("Postal code is required");
    if (!isValidPostal(formData.postalCode)) errors.push("Postal code must use letters, numbers, and spaces only");

    return errors;
  };

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      console.log('📝 Submitting registration...', formData);

      const payload = {
        masterclassId: parseInt(masterclassId),
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        mobile: formData.mobile,
        company: formData.organization || null,
        jobTitle: formData.designation || null,
        country: formData.country || null,
        postalCode: formData.postalCode || null,
        accessibilityNeeds: formData.accessibilityNeeds || null
      };

      const response = await apiClient.post(`/registrations`, payload);

      console.log('✅ Registration successful:', response.data);

      // Show QR code
      setRegistration(response.data.data);
      setShowQR(true);

      if (!response.data?.data?.qrCode && response.data?.data?.registrationId) {
        try {
          const qrResponse = await apiClient.get(
            `/registrations/${response.data.data.registrationId}`
          );
          if (qrResponse?.data?.data) {
            setRegistration(qrResponse.data.data);
          }
        } catch (qrError) {
          console.error('❌ QR fetch failed:', qrError);
        }
      }

      // Scroll to QR code section
      setTimeout(() => {
        document.querySelector('.qr-display-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error('❌ Registration error:', err);
      
      if (err.response?.status === 409) {
        setError('Masterclass is full. Please join the waitlist.');
      } else if (err.response?.data?.errors?.length) {
        setError(err.response.data.errors.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !masterclass) {
    return (
      <div className="registration-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading masterclass details...</p>
        </div>
      </div>
    );
  }

  if (error && !registration) {
    return (
      <div className="registration-container">
        <div className="error-section">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/")} className="back-button">
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  // QR Code Display Screen
  if (showQR && registration) {
    return (
      <div className="registration-container">
        <div className="success-section">
          <div className="success-header">
            <h1>✅ Registration Successful!</h1>
            <p>Your registration has been confirmed</p>
          </div>

          <div className="qr-display-section">
            <div className="qr-card">
              <div className="qr-content">
                <h2>Your Event QR Code</h2>
                <p className="qr-instruction">
                  Please save this QR code. You will need to present it at the venue.
                </p>

                {registration.qrCode && (
                  <div className="qr-code-display">
                    <img 
                      src={registration.qrCode} 
                      alt="Event QR Code"
                      className="qr-image"
                    />
                  </div>
                )}

                <div className="registration-details">
                  <div className="detail">
                    <span className="label">Registration ID:</span>
                    <span className="value">{registration.registrationId}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Name:</span>
                    <span className="value">{formData.name} {formData.surname}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Email:</span>
                    <span className="value">{formData.email}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Status:</span>
                    <span className={`value status-${registration.status?.toLowerCase() || 'confirmed'}`}>
                      {registration.status === 'CONFIRMED' ? '✅ Confirmed' : '📋 Waitlisted'}
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Masterclass:</span>
                    <span className="value">{masterclass?.title}</span>
                  </div>
                </div>

                {registration.status === 'WAITLISTED' && (
                  <div className="waitlist-notice">
                    <p>
                      🔔 You've been added to the waitlist. We'll notify you if a spot becomes available.
                    </p>
                  </div>
                )}
              </div>

              <div className="qr-actions">
                <button 
                  className="download-button"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = registration.qrCode;
                    link.download = `QR-${registration.registrationId}.png`;
                    link.click();
                  }}
                >
                  📥 Download QR Code
                </button>
                <button 
                  className="print-button"
                  onClick={() => window.print()}
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            <div className="confirmation-message">
              <p>
                ✉️ A confirmation email with your QR code has been sent to <strong>{formData.email}</strong>
              </p>
            </div>
          </div>

          <div className="navigation-buttons">
            <button onClick={() => navigate("/")} className="back-button">
              ← Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="registration-container">
      <div className="form-section">
        {/* Header */}
        <div className="form-header">
          <button onClick={() => navigate("/")} className="back-arrow">
            ← Back
          </button>
          <div>
            <h1>Building Flourishing Futures Conference</h1>
            <p className="form-subtitle">Registration Form - 7th - 8th February 2026</p>
          </div>
        </div>

        {/* Masterclass Info Preview */}
        {masterclass && (
          <div className="masterclass-preview">
            <h3>{masterclass.title}</h3>
            <p>
              {new Date(masterclass.startTime).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })} - {new Date(masterclass.endTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit"
              })} at {masterclass.location}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="registration-form">
          {/* Personal Information Section */}
          <fieldset className="form-section-group">
            <legend>👤 Personal Information</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  disabled={submitting}
                />
                <span className="field-hint">It will allow you to insert letters and spaces only</span>
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname *</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  disabled={submitting}
                />
                <span className="field-hint">It will allow you to insert letters and spaces only</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  disabled={submitting}
                />
                <span className="field-hint">Please provide your email ID. All confirmation emails and further communications will be sent to this email address.</span>
              </div>
              <div className="form-group">
                <label htmlFor="mobile">Mobile phone number *</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91-XXXXXXXXXX"
                  required
                  disabled={submitting}
                />
                <span className="field-hint">Please mention your Mobile Number</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="organization">Organisation *</label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Please mention your organization name"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="designation">Designation *</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Please mention your Designation"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
                <span className="field-hint">Please mention the name of your country of residence</span>
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code *</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                  required
                  disabled={submitting}
                />
                <span className="field-hint">Postal Code – It will allow you to insert letters, numbers, and spaces</span>
              </div>
            </div>
          </fieldset>

          {/* Professional Information Section */}
          <fieldset className="form-section-group">
            <legend>🧩 Accessibility</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accessibilityNeeds">Accessibility needs, if any</label>
                <textarea
                  id="accessibilityNeeds"
                  name="accessibilityNeeds"
                  value={formData.accessibilityNeeds}
                  onChange={handleChange}
                  placeholder="Let us know if you need any accommodations"
                  rows="4"
                  disabled={submitting}
                />
              </div>
            </div>
          </fieldset>

          {/* Terms & Conditions */}
          <div className="terms-section">
            <input type="checkbox" id="terms" required disabled={submitting} />
            <label htmlFor="terms">
              I agree to the terms and conditions and consent to receive event updates
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-mini"></span>
                Processing...
              </>
            ) : (
              <>
                📋 Complete Registration
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Sidebar */}
      <div className="info-sidebar">
        <div className="info-card">
          <h3>📋 Next Steps</h3>
          <ol>
            <li>Fill in your details</li>
            <li>Click "Complete Registration"</li>
            <li>Receive your QR code</li>
            <li>Download/Print it</li>
            <li>Present at venue</li>
          </ol>
        </div>

        <div className="info-card">
          <h3>❓ Need Help?</h3>
          <p>If you have any questions, contact our support team at:</p>
          <p className="contact-info">
            📧 support@rfevents.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
