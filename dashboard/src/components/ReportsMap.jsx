// /dashboard/src/components/ReportsMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Typography, Chip, Box, Stack, Link } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom icons for different statuses
const createCustomIcon = (status) => {
  let color = '#007bff';
  if (status === 'verified') color = '#28a745';
  else if (status === 'rejected') color = '#dc3545';
  else if (status === 'pending') color = '#ffc107';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ReportsMap = ({ reports, hotspots }) => {
  const mapCenter = [15.0, 80.0];

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={5} 
      style={{ height: '100%', width: '100%', borderRadius: '0 0 8px 8px' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Render individual report markers */}
      {reports.map((report) => (
        <Marker 
          key={report._id} 
          position={[report.location.coordinates[1], report.location.coordinates[0]]}
          icon={createCustomIcon(report.status)}
        >
          <Popup minWidth={280} maxWidth={400}>
            <Box sx={{ p: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                    {report.hazardType}
                  </Typography>
                  <Chip 
                    label={report.status} 
                    color={getStatusColor(report.status)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>
                
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  {report.description}
                </Typography>
                
                {report.location?.address && (
                  <Typography variant="caption" color="text.secondary">
                    📍 {report.location.address}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Typography>
                  {report.mediaUrl && (
                    <Link 
                      href={report.mediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      View Media →
                    </Link>
                  )}
                </Box>
                
                {report.aiConfidenceScore && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      AI Confidence: {report.aiConfidenceScore}/100
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Popup>
        </Marker>
      ))}

      {/* Render hotspot circles */}
      {hotspots.map((hotspot, index) => (
        <Circle
          key={index}
          center={[hotspot.location[1], hotspot.location[0]]}
          pathOptions={{ 
            color: '#ff4444', 
            fillColor: '#ff4444',
            weight: 2,
            opacity: 0.8
          }}
          radius={20000 * Math.sqrt(hotspot.count)}
          fillOpacity={0.15}
        >
          <Popup>
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f', mb: 1 }}>
                🔥 Hotspot Area
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{hotspot.count}</strong> verified reports in this region
              </Typography>
              <Typography variant="caption" color="text.secondary">
                High activity zone - increased monitoring recommended
              </Typography>
            </Box>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default ReportsMap;