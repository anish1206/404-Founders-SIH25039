// /dashboard/src/components/ReportsMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ReportsMap = ({ reports, hotspots }) => {
  const mapCenter = [15.0, 80.0];

  return (
    <MapContainer center={mapCenter} zoom={5} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Render individual report markers */}
      {reports.map((report) => (
        <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]}>
          <Popup><b>{report.hazardType}</b><br/>{report.description}</Popup>
        </Marker>
      ))}

      {/* Render hotspot circles */}
      {hotspots.map((hotspot, index) => (
        <Circle
          key={index}
          center={[hotspot.location[1], hotspot.location[0]]}
          pathOptions={{ color: 'red', fillColor: 'red' }}
          // Radius is in meters. Increase it based on report count.
          radius={20000 * Math.sqrt(hotspot.count)} // Base radius of 20km, scaled by count
          fillOpacity={0.2}
          stroke={false}
        >
          <Popup>
            <b>Hotspot</b><br />
            {hotspot.count} verified reports in this area.
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default ReportsMap;