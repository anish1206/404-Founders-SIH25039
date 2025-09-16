// /dashboard/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link // Import Link for the media URL
} from '@mui/material';

const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchReports();
  }, []); // The empty array [] means this effect runs once when the component mounts

  const renderContent = () => {
    if (loading) {
      return <CircularProgress />;
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (reports.length === 0) {
        return <Typography>No pending reports found.</Typography>
    }
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="hazard reports table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Hazard Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location (Lat, Lon)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Media</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow
                key={report._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {new Date(report.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{report.hazardType}</TableCell>
                <TableCell>{report.description}</TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell>
                  {`${report.location.coordinates[1].toFixed(4)}, ${report.location.coordinates[0].toFixed(4)}`}
                </TableCell>
                <TableCell>
                  <Link href={report.mediaUrl} target="_blank" rel="noopener noreferrer">
                    View Media
                  </Link>
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