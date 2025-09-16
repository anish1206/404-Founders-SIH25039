// /dashboard/src/components/ReportsMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // <-- Don't forget this import for styles!
import L from 'leaflet'; // Import Leaflet to fix a known issue with default icons

// FIX: A common issue with react-leaflet is that the default marker icon doesn't show up.
// This code manually re-imports the icon images.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- END FIX ---

const ReportsMap = ({ reports }) => {
  // Set a default center for the map, e.g., somewhere in the middle of the Indian coastline
  const mapCenter = [15.0, 80.0];

  return (
    <MapContainer center={mapCenter} zoom={5} style={{ height: '500px', width: '100%', marginBottom: '20px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {reports.map((report) => (
        <Marker 
          key={report._id} 
          position={[
            report.location.coordinates[1], // Latitude
            report.location.coordinates[0]  // Longitude
          ]}
        >
          <Popup>
            <b>{report.hazardType}</b><br />
            Status: {report.status}<br />
            {report.description}<br />
            <a href={report.mediaUrl} target="_blank" rel="noopener noreferrer">View Media</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ReportsMap;