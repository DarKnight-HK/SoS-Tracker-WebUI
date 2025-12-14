'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

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

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Map({ history }: { history: any[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for client mount to avoid hydration mismatch on theme
  useEffect(() => setMounted(true), []);

  if (!history || history.length === 0) {
    return (
      <div className="h-full w-full bg-background flex flex-col items-center justify-center text-muted-foreground animate-pulse">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Searching for Satellite Signal...</p>
      </div>
    );
  }

  const center: [number, number] = [history[0].lat, history[0].lng];
  const path = history.map(p => [p.lat, p.lng] as [number, number]);

  // Determine Tile Layer based on Theme
  // Dark: CartoDB Dark Matter | Light: CartoDB Positron (High Readability)
  const tileUrl = mounted && resolvedTheme === 'light'
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const pathColor = mounted && resolvedTheme === 'light' ? '#2563eb' : '#3b82f6'; // Darker blue for light mode

  return (
    <MapContainer center={center} zoom={15} className="h-full w-full z-0 bg-background" zoomControl={false}>
      <TileLayer 
        key={tileUrl} // Forces re-render when theme changes
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={tileUrl}
      />
      
      <MapUpdater center={center} />
      
      <Polyline positions={path} pathOptions={{ color: pathColor, weight: 4, opacity: 0.8, dashArray: '10, 10' }} />
      
      <Marker position={center} icon={techIcon}>
        <Popup className="tech-popup">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Target Located</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Bat: {history[0].battery}% <br/>
            Type: {history[0].type}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
