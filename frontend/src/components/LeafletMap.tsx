import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { mapMarkers, severityColors } from '../data/dummyData';
import { AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap: React.FC = () => {
  const createCustomIcon = (severity: string) => {
    const color = severityColors[severity as keyof typeof severityColors];
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Interactive Disaster Map</h3>
            <p className="text-sm text-gray-400">Real-time damage assessment markers</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColors.critical }}></div>
              <span className="text-gray-300">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColors.high }}></div>
              <span className="text-gray-300">High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColors.medium }}></div>
              <span className="text-gray-300">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColors.low }}></div>
              <span className="text-gray-300">Low</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-96">
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={11}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon(marker.severity)}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle 
                      className="w-4 h-4" 
                      style={{ color: severityColors[marker.severity as keyof typeof severityColors] }}
                    />
                    <span className="font-semibold">{marker.title}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Severity: <span className="capitalize font-medium">{marker.severity}</span></div>
                    <div>Coordinates: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {mapMarkers.length} damage markers across the affected area
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Critical: {mapMarkers.filter(m => m.severity === 'critical').length}</span>
            <span>High: {mapMarkers.filter(m => m.severity === 'high').length}</span>
            <span>Medium: {mapMarkers.filter(m => m.severity === 'medium').length}</span>
            <span>Low: {mapMarkers.filter(m => m.severity === 'low').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;