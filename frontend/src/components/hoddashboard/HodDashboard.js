import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './HodDashboard.css';

const HodDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterResourcePerson, setFilterResourcePerson] = useState('');
  const [filterFacultyCoordinator, setFilterFacultyCoordinator] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:4000/lecture-api/completed-and-scheduled', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          setRequests(response.data.requests);
          setFilteredRequests(response.data.requests);
        } else {
          setError('Failed to fetch lecture details');
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch lecture details');
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = requests;

      if (filterFromDate && filterToDate) {
        filtered = filtered.filter(request =>
          new Date(request.date) >= new Date(filterFromDate) && new Date(request.date) <= new Date(filterToDate)
        );
      }

      if (filterTopic) {
        filtered = filtered.filter(request =>
          request.topic.toLowerCase().includes(filterTopic.toLowerCase())
        );
      }

      if (filterResourcePerson) {
        filtered = filtered.filter(request =>
          request.resourcePerson.toLowerCase().includes(filterResourcePerson.toLowerCase())
        );
      }

      if (filterFacultyCoordinator) {
        filtered = filtered.filter(request =>
          request.facultyCoordinator.toLowerCase().includes(filterFacultyCoordinator.toLowerCase())
        );
      }

      setFilteredRequests(filtered);
    };

    applyFilters();
  }, [filterFromDate, filterToDate, filterTopic, filterResourcePerson, filterFacultyCoordinator, requests]);

  const getUniqueOptions = (key) => {
    return [...new Set(requests.map(request => request[key]))];
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById('pdf-content');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save("report.pdf");
      });
  };

  return (
    <div className="hod-dashboard">
      <h2>HOD Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}
          <div className="filters">
            <div className="form-group">
              <label>From Date:</label>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>To Date:</label>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Topic:</label>
              <input
                type="text"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Resource Person:</label>
              <input
                type="text"
                value={filterResourcePerson}
                onChange={(e) => setFilterResourcePerson(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Faculty Coordinator:</label>
              <input
                type="text"
                value={filterFacultyCoordinator}
                onChange={(e) => setFilterFacultyCoordinator(e.target.value)}
                className="form-control"
              />
            </div>
            <button className="btn btn-primary" onClick={handleDownloadPDF}>Generate Report (PDF)</button>
          </div>
          <div id="pdf-content">
            <table className="table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name of Lecture</th>
                  <th>Resource Person</th>
                  <th>Faculty Coordinator</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Topic</th>
                  <th>Designation</th>
                  <th>Organization</th>
                  <th>Attendees</th>
                  <th>Year</th>
                  <th>Branch</th>
                  <th>Section</th>
                  <th>HOD Name</th>
                  <th>Faculty Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <tr key={request._id}>
                    <td>{index + 1}</td>
                    <td>{request.lectureName}</td>
                    <td>{request.resourcePerson}</td>
                    <td>{request.facultyCoordinator}</td>
                    <td>{request.venue}</td>
                    <td>{request.date}</td>
                    <td>{request.time}</td>
                    <td>{request.duration}</td>
                    <td>{request.topic}</td>
                    <td>{request.designation}</td>
                    <td>{request.organization}</td>
                    <td>{request.attendees}</td>
                    <td>{request.year}</td>
                    <td>{request.branch}</td>
                    <td>{request.section}</td>
                    <td>{request.hodName}</td>
                    <td>{request.facultyName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default HodDashboard;
