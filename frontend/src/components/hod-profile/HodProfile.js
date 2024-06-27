// src/components/HodProfile.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import Logout from '../Logout/Logout';
import './HodProfile.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HodProfile = () => {
  const { user } = useContext(UserContext);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get('http://localhost:4000/lecture-api/pending-requests', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setPendingRequests(response.data.requests);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setError('Failed to fetch pending requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [user]);

  const handleApproval = async (requestId, action) => {
    if (action === 'reject' && !rejectionReason) {
      setError('Rejection reason is required');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:4000/lecture-api/${action}-request`, { requestId, reason: rejectionReason }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        setPendingRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
        await sendNotification(requestId, action, rejectionReason);
      } else {
        setError(response.data.message || 'Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      setError('Failed to update request. Please try again later.');
    } finally {
      setRejectionReason('');
      setShowRejectionModal(false);
    }
  };

  const sendNotification = async (requestId, action, reason) => {
    try {
      await axios.post(`http://localhost:4000/lecture-api/send-notification`, {
        requestId,
        action,
        reason
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleReject = (requestId) => {
    setCurrentRequestId(requestId);
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = () => {
    handleApproval(currentRequestId, 'reject');
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.text('Pending Requests Report', 20, 10);
    doc.autoTable({
      head: [['Topic', 'Date', 'Time', 'Resource Person', 'Attendees', 'Venue', 'Description']],
      body: pendingRequests.map(request => [
        request.topic,
        request.date,
        request.time,
        request.resourcePerson,
        request.attendees,
        request.venue,
        request.description
      ])
    });
    doc.save('pending_requests_report.pdf');
  };

  if (!user || user.role !== 'hod') {
    return <div className="unauthorized">Unauthorized access</div>;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="hod-profile">
      <header className="header">
        <h1>HOD Profile</h1>
        <nav>
          <ul className="nav-list">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><button className="btn report-btn" onClick={handleGenerateReport}>Generate Report</button></li>
          </ul>
        </nav>
      </header>
      <Logout />
      <main>
        <h2>Pending Requests</h2>
        {error && <div className="error">{error}</div>}
        <ul className="requests-list">
          {pendingRequests.map(request => (
            <li key={request._id} className="request-item">
              <div className="request-details">
                <p><strong>Topic:</strong> {request.topic}</p>
                <p><strong>Date:</strong> {request.date}</p>
                <p><strong>Time:</strong> {request.time}</p>
                <p><strong>Resource Person:</strong> {request.resourcePerson}</p>
                <p><strong>Attendees:</strong> {request.attendees}</p>
                <p><strong>Venue:</strong> {request.venue}</p>
                <p><strong>Description:</strong> {request.description}</p>
              </div>
              <div className="request-actions">
                <button className="btn approve-btn" onClick={() => handleApproval(request._id, 'approve')}>Approve</button>
                <button className="btn reject-btn" onClick={() => handleReject(request._id)}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
        {showRejectionModal && (
          <div className="rejection-modal">
            <div className="rejection-content">
              <h3>Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection"
              ></textarea>
              <button className="btn submit-btn" onClick={handleRejectSubmit}>Submit</button>
              <button className="btn cancel-btn" onClick={() => setShowRejectionModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HodProfile;
