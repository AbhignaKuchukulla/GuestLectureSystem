import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import './RequestPage.css';

const RequestPage = () => {
  const { user } = useContext(UserContext);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [topic, setTopic] = useState('');
  const [attendees, setAttendees] = useState('');
  const [venue, setVenue] = useState('');
  const [hodName, setHodName] = useState('');
  const [hods, setHods] = useState([]);
  const [resourcePerson, setResourcePerson] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHods = async () => {
      try {
        const response = await axios.get('http://localhost:4000/hod-api/hods', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          setHods(response.data.hods);
        } else {
          setError('Failed to fetch HOD names');
        }
      } catch (error) {
        setError('Failed to fetch HOD names');
      }
    };

    fetchHods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const requestData = {
      date,
      time,
      topic,
      attendees,
      venue,
      hodName,
      resourcePerson,
      description,
      facultyId: user ? user._id : null,
    };

    try {
      const response = await axios.post('http://localhost:4000/lecture-api/submit-request', requestData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        alert('Request submitted successfully!');
        navigate('/');
      } else {
        setError(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Request submission failed');
    }
  };

  return (
    <div className="request-page">
      <form onSubmit={handleSubmit} className="request-form">
        <h2>Request Guest Lecture</h2>
        {error && <div className="error">{error}</div>}
        <label>
          Date:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Time:
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <label>
          Topic:
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
        </label>
        <label>
          Number of Attendees:
          <input type="number" value={attendees} onChange={(e) => setAttendees(e.target.value)} required />
        </label>
        <label>
          Venue:
          <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required />
        </label>
        <label>
          HOD Name:
          <select value={hodName} onChange={(e) => setHodName(e.target.value)} required>
            <option value="" disabled>Select HOD</option>
            {hods.map((hod) => (
              <option key={hod._id} value={hod.username}>{hod.username}</option>
            ))}
          </select>
        </label>
        <label>
          Resource Person:
          <input type="text" value={resourcePerson} onChange={(e) => setResourcePerson(e.target.value)} required />
        </label>
        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestPage;
