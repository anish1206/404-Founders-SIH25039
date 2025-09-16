// /dashboard/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import {
  Container, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link,
  Box, Button, Chip // Import Box, Button, and Chip
} from '@mui/material';

const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null); // To track which report is being updated

  const fetchReports = async () => {
    try {
      const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/reports`;
      const response = await axios.get(apiEndpoint);
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch reports. Please try again later.');
      console.error(err);
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

      // Update the report in the local state for an instant UI update
      setReports(currentReports =>
        currentReports.map(report =>
          report._id === reportId ? response.data : report
        )
      );
    } catch (err) {
      setError('Failed to update report status.');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };
  
  const getStatusChip = (status) => {
    const color = status === 'pending' ? 'warning' : status === 'verified' ? 'success' : 'error';
    return <Chip label={status} color={color} size="small" />;
  };

  const renderContent = () => {
    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (reports.length === 0) return <Typography>No pending reports found.</Typography>;

    return (
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
                  {updatingId === report._id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleUpdateStatus(report._id, 'verified')}
                        disabled={report.status !== 'pending'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleUpdateStatus(report._id, 'rejected')}
                        disabled={report.status !== 'pending'}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Hazard Reports Verification Queue
        </Typography>
        {renderContent()}
      </Container>
    </Layout>
  );
};

export default DashboardPage;