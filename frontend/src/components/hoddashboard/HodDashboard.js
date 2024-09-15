import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './HodDashboard.css';

const HODDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [filterResourcePerson, setFilterResourcePerson] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('');
  const [filterYearOfLecture, setFilterYearOfLecture] = useState('');
  const [filterYearOfStudent, setFilterYearOfStudent] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:4000/lecture-api/approved-requests', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          console.log('Fetched Requests:', response.data.requests); // Debug log
          setRequests(response.data.requests);
          setFilteredRequests(response.data.requests);
        } else {
          setError('Failed to fetch approved requests');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching approved requests:', error); // Debug log
        setError('Failed to fetch approved requests');
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = requests;

      if (filterResourcePerson) {
        filtered = filtered.filter(request =>
          request.resourcePerson.toLowerCase().includes(filterResourcePerson.toLowerCase())
        );
      }

      if (filterOrganization) {
        filtered = filtered.filter(request =>
          request.organization.toLowerCase().includes(filterOrganization.toLowerCase())
        );
      }

      if (filterYearOfLecture) {
        filtered = filtered.filter(request =>
          request.yearOfLecture === filterYearOfLecture
        );
      }

      if (filterYearOfStudent) {
        filtered = filtered.filter(request =>
          request.yearOfStudent === filterYearOfStudent
        );
      }

      if (filterFaculty) {
        filtered = filtered.filter(request =>
          request.facultyName.toLowerCase().includes(filterFaculty.toLowerCase())
        );
      }

      setFilteredRequests(filtered);
    };

    applyFilters();
  }, [filterResourcePerson, filterOrganization, filterYearOfLecture, filterYearOfStudent, filterFaculty, requests]);

  const getUniqueOptions = (key) => {
    return [...new Set(requests.map(request => request[key]))];
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const tableColumn = ["S.No", "Topic", "Resource Person", "Designation", "Organization", "Date", "Time", "Duration", "Venue", "Year of Student", "Branch", "Section", "Faculty Name"];
    const tableRows = [];

    filteredRequests.forEach((request, index) => {
      const requestData = [
        index + 1,
        request.topic,
        request.resourcePerson,
        request.designation,
        request.organization,
        request.date,
        request.time,
        request.duration,
        request.venue,
        request.yearOfStudent,
        request.branch,
        request.section,
        request.facultyName
      ];
      tableRows.push(requestData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Approved Lecture Requests Report", 14, 15);
    doc.save("approved_requests_report.pdf");
  };

  return (
    <div className="dashboard">
      <h2>HOD Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && <div className="error">{error}</div>}
          <div className="filters">
            <input
              type="text"
              placeholder="Search Resource Person"
              value={filterResourcePerson}
              onChange={(e) => setFilterResourcePerson(e.target.value)}
            />
            <input
              type="text"
              placeholder="Search Organization"
              value={filterOrganization}
              onChange={(e) => setFilterOrganization(e.target.value)}
            />
            <select
              value={filterYearOfLecture}
              onChange={(e) => setFilterYearOfLecture(e.target.value)}
            >
              <option value="">All Years of Lecture</option>
              {getUniqueOptions('yearOfLecture').map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={filterYearOfStudent}
              onChange={(e) => setFilterYearOfStudent(e.target.value)}
            >
              <option value="">All Years of Student</option>
              {getUniqueOptions('yearOfStudent').map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search Faculty Name"
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
            />
          </div>
          <button onClick={generatePDF} className="btn">Generate PDF Report</button>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Topic</th>
                <th>Resource Person</th>
                <th>Designation</th>
                <th>Organization</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Venue</th>
                <th>Year of Student</th>
                <th>Branch</th>
                <th>Section</th>
                <th>Faculty Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr key={request._id}>
                  <td>{index + 1}</td>
                  <td>{request.topic}</td>
                  <td>{request.resourcePerson}</td>
                  <td>{request.designation}</td>
                  <td>{request.organization}</td>
                  <td>{request.date}</td>
                  <td>{request.time}</td>
                  <td>{request.duration}</td>
                  <td>{request.venue}</td>
                  <td>{request.yearOfStudent}</td>
                  <td>{request.branch}</td>
                  <td>{request.section}</td>
                  <td>{request.facultyName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default HODDashboard;
