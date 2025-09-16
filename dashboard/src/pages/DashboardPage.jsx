// /dashboard/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ReportsMap from '../components/ReportsMap'; // <-- Import the new map component
import axios from 'axios';
import {
  Container, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link,
  Box, Button, Chip
} from '@mui/material';

const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = async () => {
    try {
      const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/reports`;
      const response = await axios.get(apiEndpoint);
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    try {
      const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/reports/${reportId}/status`;
      const response = await axios.patch(apiEndpoint, { status: newStatus });
      setReports(currentReports =>
        currentReports.map(report =>
          report._id === reportId ? response.data : report
        )
      );
    } catch (err) {
      setError('Failed to update report status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusChip = (status) => {
    const color = status === 'pending' ? 'warning' : status === 'verified' ? 'success' : 'error';
    return <Chip label={status} color={color} size="small" />;
  };
  
  const renderContent = () => {
      if (reports.length === 0 && !loading) {
          return <Typography>No reports found.</Typography>;
      }
      return (
          <>
              {/* --- RENDER THE MAP COMPONENT HERE --- */}
              <Typography variant="h5" component="h2" gutterBottom>
                  Hazard Map
              </Typography>
              <Paper sx={{ mb: 3 }}>
                  <ReportsMap reports={reports} />
              </Paper>
              
              {/* --- RENDER THE TABLE COMPONENT HERE --- */}
              <Typography variant="h5" component="h2" gutterBottom>
                  Verification Queue
              </Typography>
              <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                          <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Hazard Type</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Media</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {reports.map((report) => (
                              <TableRow key={report._id}>
                                  <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                                  <TableCell>{getStatusChip(report.status)}</TableCell>
                                  <TableCell>{report.hazardType}</TableCell>
                                  <TableCell>{report.description}</TableCell>
                                  <TableCell>
                                      <Link href={report.mediaUrl} target="_blank" rel="noopener noreferrer">
                                          View Media
                                      </Link>
                                  </TableCell>
                                  <TableCell>
                                      {updatingId === report._id ? (<CircularProgress size={20} />) : (
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                              <Button variant="contained" color="success" size="small" onClick={() => handleUpdateStatus(report._id, 'verified')} disabled={report.status !== 'pending'}>Approve</Button>
                                              <Button variant="contained" color="error" size="small" onClick={() => handleUpdateStatus(report._id, 'rejected')} disabled={report.status !== 'pending'}>Reject</Button>
                                          </Box>
                                      )}
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </TableContainer>
          </>
      );
  };

  return (
    <Layout>
      <Container maxWidth="xl"> {/* Changed to xl for more space */}
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : renderContent()}
      </Container>
    </Layout>
  );
};

export default DashboardPage;