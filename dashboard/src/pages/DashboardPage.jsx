// /dashboard/src/pages/DashboardPage.jsx
// Modern dashboard with card-based layout, filters, and improved UX

import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import ReportsMap from '../components/ReportsMap';
import ReportsTimeline from '../components/ReportsTimeline';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import {
  Container, Typography, CircularProgress, Alert, Paper, Link,
  Box, Button, Chip, Card, CardContent, CardActions, CardHeader,
  Grid, TextField, MenuItem, FormControl, Select, InputLabel,
  Stack, Avatar, Divider, IconButton, Tooltip, Badge
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
  Pending as PendingIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  Assessment as ScoreIcon,
  OpenInNew as OpenIcon,
  FilterList as FilterIcon,
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';

const DashboardPage = () => {
  const [user, authLoading] = useAuthState(auth);
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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

  // Filter reports based on active filters
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesLocation = !locationFilter || 
        report.location.address?.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesType = !typeFilter || report.hazardType === typeFilter;
      const matchesStatus = !statusFilter || report.status === statusFilter;
      const matchesDate = !dateFilter || 
        new Date(report.createdAt).toDateString() === new Date(dateFilter).toDateString();
      
      return matchesLocation && matchesType && matchesStatus && matchesDate;
    });
  }, [reports, locationFilter, typeFilter, statusFilter, dateFilter]);

  // Get unique hazard types for filter dropdown
  const hazardTypes = useMemo(() => {
    return [...new Set(reports.map(report => report.hazardType))];
  }, [reports]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const verified = reports.filter(r => r.status === 'verified').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;
    const pending = reports.filter(r => r.status === 'pending').length;
    
    return { total, verified, rejected, pending };
  }, [reports]);

  // Build timeline data (last 30 days) from filtered reports
  const timelineData = useMemo(() => {
    // For analyst focus on verified and pending; for admin use all filtered
    const source = userRole === 'analyst'
      ? filteredReports.filter(r => r.status !== 'rejected')
      : filteredReports;

    const days = 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    const keyFor = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const buckets = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      buckets.set(keyFor(d), 0);
    }

    source.forEach(r => {
      const d = new Date(r.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = keyFor(d);
      if (buckets.has(key)) {
        buckets.set(key, buckets.get(key) + 1);
      }
    });

    return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
  }, [filteredReports, userRole]);

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'rejected': return <RejectIcon sx={{ color: '#f44336' }} />;
      case 'pending': return <PendingIcon sx={{ color: '#ff9800' }} />;
      default: return <PendingIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#e8f5e8';
      case 'rejected': return '#ffebee';
      case 'pending': return '#fff3e0';
      default: return '#f5f5f5';
    }
  };
  
  // Statistics cards component
  const StatisticsCards = () => {
    // For analysts, show different statistics
    if (userRole === 'analyst') {
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              bgcolor: '#f8f9fa', 
              border: '1px solid #e9ecef',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#007bff', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <AnalyticsIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#007bff' }}>
                  {stats.total}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Total Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              bgcolor: '#f0f9ff', 
              border: '1px solid #bae6fd',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <CheckIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {stats.verified}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Verified Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              bgcolor: '#f0fdf4', 
              border: '1px solid #bbf7d0',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#10b981', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <MapIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                  {hotspots.length}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Active Hotspots
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    // For admins, show all statistics
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#f8f9fa', 
            border: '1px solid #e9ecef',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-2px)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#007bff', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <AnalyticsIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#007bff' }}>
                {stats.total}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#f0f9ff', 
            border: '1px solid #bae6fd',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-2px)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <CheckIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {stats.verified}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#fef7f0', 
            border: '1px solid #fed7aa',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-2px)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#ff9800', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <PendingIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {stats.pending}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: '#fef2f2', 
            border: '1px solid #fecaca',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-2px)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ bgcolor: '#f44336', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <RejectIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {stats.rejected}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Filters component
  const FiltersSection = () => (
    <Paper sx={{ p: 3, mb: 3, bgcolor: '#fafbfc', border: '1px solid #e1e4e8' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <FilterIcon sx={{ mr: 1, color: '#6c757d' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Filters</Typography>
        </Box>
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<ResetIcon />}
          onClick={() => {
            setLocationFilter('');
            setTypeFilter('');
            setStatusFilter('');
            setDateFilter('');
          }}
          disabled={!locationFilter && !typeFilter && !statusFilter && !dateFilter}
        >
          Clear All Filters
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Search Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            variant="outlined"
            placeholder="e.g., Mumbai, Andheri East"
            sx={{ bgcolor: 'white', width: '100%' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small" sx={{ bgcolor: 'white', width: '100%' }}>
            <InputLabel id="hazard-type-label" shrink>Hazard Type</InputLabel>
            <Select
              id="hazard-type"
              labelId="hazard-type-label"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Hazard Type"
              fullWidth
              displayEmpty
              renderValue={(val) => (val ? val : (
                <em style={{ color: '#6c757d' }}>All Types</em>
              ))}
            >
              <MenuItem value="">All Types</MenuItem>
              {hazardTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small" sx={{ bgcolor: 'white', width: '100%' }}>
            <InputLabel id="status-label" shrink>Status</InputLabel>
            <Select
              id="status"
              labelId="status-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              fullWidth
              displayEmpty
              renderValue={(val) => (val ? (
                val.charAt(0).toUpperCase() + val.slice(1)
              ) : (
                <em style={{ color: '#6c757d' }}>All Status</em>
              ))}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            placeholder="yyyy-mm-dd"
            sx={{ bgcolor: 'white', width: '100%' }}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  // Report cards for admin
  const renderAdminCards = () => (
    <Grid container spacing={3}>
      {filteredReports.map((report) => (
        <Grid item xs={12} md={6} lg={4} key={report._id}>
          <Card sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: getStatusColor(report.status),
            border: `1px solid ${report.status === 'verified' ? '#4caf50' : report.status === 'rejected' ? '#f44336' : '#ff9800'}20`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
            }
          }}>
            <CardHeader
              avatar={getStatusIcon(report.status)}
              action={
                <Stack direction="row" spacing={1}>
                  {getScoreChip(report.aiConfidenceScore)}
                  <Chip 
                    label={report.status} 
                    color={report.status === 'verified' ? 'success' : report.status === 'rejected' ? 'error' : 'warning'}
                    size="small"
                  />
                </Stack>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  {report.hazardType}
                </Typography>
              }
              subheader={
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <DateIcon fontSize="small" sx={{ color: '#6c757d' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
              }
            />
            
            <CardContent sx={{ flexGrow: 1, pt: 0 }}>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                {report.description}
              </Typography>
              
              {report.location?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon fontSize="small" sx={{ color: '#6c757d', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {report.location.address}
                  </Typography>
                </Box>
              )}
              
              {report.mediaUrl && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenIcon />}
                    onClick={() => window.open(report.mediaUrl, '_blank')}
                    sx={{ textTransform: 'none' }}
                  >
                    View Media
                  </Button>
                </Box>
              )}
            </CardContent>
            
            {userRole === 'admin' && report.status === 'pending' && (
              <CardActions sx={{ p: 2, pt: 0 }}>
                {updatingId === report._id ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleUpdateStatus(report._id, 'verified')}
                      sx={{ flex: 1, textTransform: 'none' }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<RejectIcon />}
                      onClick={() => handleUpdateStatus(report._id, 'rejected')}
                      sx={{ flex: 1, textTransform: 'none' }}
                    >
                      Reject
                    </Button>
                  </Stack>
                )}
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Report cards for analyst (simplified version)
  const renderAnalystCards = () => (
    <Grid container spacing={3}>
      {filteredReports.map((report) => (
        <Grid item xs={12} md={6} lg={4} key={report._id}>
          <Card sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: getStatusColor(report.status),
            border: `1px solid ${report.status === 'verified' ? '#4caf50' : '#f44336'}20`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
            }
          }}>
            <CardHeader
              avatar={getStatusIcon(report.status)}
              action={
                <Chip 
                  label={report.status} 
                  color={report.status === 'verified' ? 'success' : 'error'}
                  size="small"
                />
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  {report.hazardType}
                </Typography>
              }
              subheader={
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <DateIcon fontSize="small" sx={{ color: '#6c757d' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
              }
            />
            
            <CardContent sx={{ flexGrow: 1, pt: 0 }}>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                {report.description}
              </Typography>
              
              {report.location?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon fontSize="small" sx={{ color: '#6c757d', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {report.location.address}
                  </Typography>
                </Box>
              )}
              
              {report.mediaUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenIcon />}
                  onClick={() => window.open(report.mediaUrl, '_blank')}
                  sx={{ textTransform: 'none' }}
                >
                  View Media
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={48} />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (!userRole) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={48} />
        </Box>
      );
    }

    return (
      <>
        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Main Map Section */}
        <Paper sx={{ 
          mb: 4, 
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e1e4e8'
        }}>
          <Box sx={{ 
            bgcolor: '#f8f9fa', 
            px: 3, 
            py: 2, 
            borderBottom: '1px solid #e1e4e8',
            display: 'flex',
            alignItems: 'center'
          }}>
            <MapIcon sx={{ mr: 2, color: '#007bff' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Hazard Distribution Map
            </Typography>
          </Box>
          <Box sx={{ height: 600 }}>
            <ReportsMap reports={filteredReports.filter(report => report.status !== 'rejected')} hotspots={hotspots} />
          </Box>
        </Paper>

        {userRole === 'analyst' && (
          <Paper sx={{ 
            mb: 4,
            p: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e1e4e8'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AnalyticsIcon sx={{ mr: 2, color: '#0d6efd' }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                Reports Timeline (Last 30 Days)
              </Typography>
            </Box>
            <ReportsTimeline data={timelineData} />
          </Paper>
        )}

        {/* Filters Section */}
        <FiltersSection />

        {/* Reports Section */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e1e4e8'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              {userRole === 'admin' ? 'Reports Management' : 'Verified Reports'}
            </Typography>
            <Badge badgeContent={filteredReports.length} color="primary">
              <Chip 
                label={`${filteredReports.length} of ${reports.length} reports`} 
                variant="outlined" 
                size="small" 
              />
            </Badge>
          </Box>

          {filteredReports.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '2px dashed #dee2e6'
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No reports found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reports.length === 0 ? 'No reports available yet.' : 'Try adjusting your filters to see more results.'}
              </Typography>
            </Box>
          ) : (
            <>
              {userRole === 'admin' && renderAdminCards()}
              {userRole === 'analyst' && renderAnalystCards()}
            </>
          )}
        </Paper>
      </>
    );
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700, 
              color: '#2c3e50',
              mb: 1 
            }}>
              {userRole === 'admin' ? 'Admin Dashboard' : 'Analyst Dashboard'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {userRole === 'admin' 
                ? 'Manage and verify hazard reports from across the region' 
                : 'View verified hazard reports and analysis'
              }
            </Typography>
          </Box>
          <Box>
            <Chip 
              label={`Welcome, ${user?.email?.split('@')[0] || 'User'}`}
              variant="outlined"
              avatar={<Avatar sx={{ width: 24, height: 24 }}>{user?.email?.charAt(0).toUpperCase()}</Avatar>}
            />
          </Box>
        </Box>
        {renderContent()}
      </Container>
    </Layout>
  );
};

export default DashboardPage;