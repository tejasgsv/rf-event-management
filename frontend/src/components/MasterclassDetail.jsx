import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const MasterclassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { email, updateEmail } = useContext(UserContext);
  const [masterclass, setMasterclass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState(email || '');

  useEffect(() => {
    const fetchMasterclass = async () => {
      try {
        const response = await axios.get(`/api/masterclasses/${id}`);
        const payload = response?.data?.data || response?.data;
        setMasterclass(payload);
      } catch (err) {
        setError('Failed to load masterclass details');
      } finally {
        setLoading(false);
      }
    };
    fetchMasterclass();
  }, [id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !userEmail) {
      alert('Please fill in all fields');
      return;
    }

    setRegistering(true);
    try {
      const response = await axios.post(`/api/registrations/${id}`, {
        name,
        email: userEmail,
      });

      updateEmail(userEmail); // Update context
      alert(response.data.message);

      if (response.data.qrCode) {
        navigate('/qr'); // Redirect to QR page
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!masterclass) return <div className="no-data">Masterclass not found</div>;

  const isFull = (masterclass?.bookedCount || 0) >= (masterclass?.capacity || 0);
  const isClosed = masterclass?.registrationCloseTime && new Date() >= new Date(masterclass.registrationCloseTime);

  return (
    <div className="masterclass-detail">
      <h1>{masterclass.title}</h1>
      <p className="description">{masterclass.description}</p>
      <div className="details">
        <p><strong>Start Time:</strong> {new Date(masterclass.startTime).toLocaleString()}</p>
        <p><strong>End Time:</strong> {new Date(masterclass.endTime).toLocaleString()}</p>
        <p><strong>Location:</strong> {masterclass.location}</p>
        <p><strong>Capacity:</strong> {masterclass.capacity}</p>
        <p><strong>Booked:</strong> {masterclass.bookedCount}</p>
      </div>

      {!isClosed ? (
        <form onSubmit={handleRegister} className="registration-form">
          <h2>Register for this Masterclass</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={registering || isFull}>
            {registering ? 'Registering...' : isFull ? 'Join Waitlist' : 'Register'}
          </button>
        </form>
      ) : (
        <p className="closed">Registration is closed for this masterclass.</p>
      )}
    </div>
  );
};

export default MasterclassDetail;
