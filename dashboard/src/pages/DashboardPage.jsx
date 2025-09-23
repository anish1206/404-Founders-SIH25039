// /dashboard/src/pages/DashboardPage.jsx
// This is the complete code for the main dashboard page.
// It handles role-based access control (Admin vs. Analyst) and displays reports, maps, and hotspots accordingly.

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ReportsMap from '../components/ReportsMap';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import {
  Container, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link,
  Box, Button, Chip
} from '@mui/material';

const DashboardPage = () => {
  const [user, authLoading] = useAuthState(auth);
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchUserRoleAndData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const tokenResult = await user.getIdTokenResult();
        // Logic: If role is explicitly 'analyst', use it. Otherwise, default to 'admin'.
        const role = tokenResult.claims.role === 'analyst' ? 'analyst' : 'admin';
        setUserRole(role);

        // Fetch reports based on the user's role
        const reportsApiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/reports?role=${role}`;
        const reportsResponse = await axios.get(reportsApiEndpoint);
        setReports(reportsResponse.data);

        // Admins and Analysts can both see hotspots
        const hotspotsApiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/reports/hotspots`;
        const hotspotsResponse = await axios.get(hotspotsApiEndpoint);
        setHotspots(hotspotsResponse.data);

      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
        fetchUserRoleAndData();
    }
  }, [user, authLoading]);

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
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };
  
  const getStatusChip = (status) => {
    const color = status === 'pending' ? 'warning' : status === 'verified' ? 'success' : 'error';
    return <Chip label={status} color={color} size="small" />;
  };

  const getScoreChip = (score) => {
    let color = 'default';
    if (score >= 75) color = 'success';
    else if (score >= 40) color = 'warning';
    else if (score > 0) color = 'error';
    return <Chip label={`${score} / 100`} color={color} size="small" variant="outlined" />;
  };
  
  const renderAdminTable = () => (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>AI Score</TableCell>
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
              <TableCell>{getScoreChip(report.aiConfidenceScore)}</TableCell>
              <TableCell>{report.hazardType}</TableCell>
              <TableCell>{report.description}</TableCell>
              <TableCell><Link href={report.mediaUrl} target="_blank" rel="noopener noreferrer">View Media</Link></TableCell>
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
  );

  const renderAnalystTable = () => (
    <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
            <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Hazard Type</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Media</TableCell></TableRow></TableHead>
            <TableBody>
                {reports.map((report) => (
                    <TableRow key={report._id}>
                        <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{getStatusChip(report.status)}</TableCell>
                        <TableCell>{report.hazardType}</TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell><Link href={report.mediaUrl} target="_blank" rel="noopener noreferrer">View Media</Link></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
  );

  const renderContent = () => {
    if (loading || authLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    if (!userRole) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (reports.length === 0) return <Typography sx={{ mt: 2 }}>No reports to display.</Typography>;

    return (
      <>
        <Typography variant="h5" component="h2" gutterBottom>Hazard Map</Typography>
        <Paper sx={{ mb: 3 }}><ReportsMap reports={reports} hotspots={hotspots} /></Paper>
        {userRole === 'admin' && (
          <>
            <Typography variant="h5" component="h2" gutterBottom>Verification Queue</Typography>
            {renderAdminTable()}
          </>
        )}
        {userRole === 'analyst' && (
          <>
            <Typography variant="h5" component="h2" gutterBottom>Verified Reports</Typography>
            {renderAnalystTable()}
          </>
        )}
      </>
    );
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          {userRole === 'admin' ? 'Admin Dashboard' : 'Analyst Dashboard'}
        </Typography>
        {renderContent()}
      </Container>
    </Layout>
  );
};

export default DashboardPage;