'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// --- Fix Leaflet Default Icon ---
const techIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Component to smoothly pan the map when new points arrive
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Map({ history }: { history: any[] }) {
  // Loading State / Empty State
  if (!history || history.length === 0) {
    return (
      <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 animate-pulse">
        <div className="h-12 w-12 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Searching for Satellite Signal...</p>
      </div>
    );
  }

  const center: [number, number] = [history[0].lat, history[0].lng];
  const path = history.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <MapContainer center={center} zoom={15} className="h-full w-full z-0 bg-slate-950" zoomControl={false}>
      {/* Dark Matter Map Tiles */}
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
      />
      
      <MapUpdater center={center} />
      
      {/* The Path Line */}
      <Polyline positions={path} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.6, dashArray: '10, 10' }} />
      
      {/* The Current Location Marker */}
      <Marker position={center} icon={techIcon}>
        <Popup className="tech-popup">
          <div className="text-sm font-bold">Target Located</div>
          <div className="text-xs text-slate-500">
            Bat: {history[0].battery}% <br/>
            Type: {history[0].type}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
