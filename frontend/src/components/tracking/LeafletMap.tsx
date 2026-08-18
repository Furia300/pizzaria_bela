import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LeafletMapProps {
  storePos?: [number, number]; // [lat, lng]
  deliveryPos?: [number, number];
  courierPos?: [number, number];
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  storePos = [-23.561414, -46.655881], // Bela Vista SP
  deliveryPos = [-23.5678, -46.6489],
  courierPos
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: courierPos || storePos,
        zoom: 14,
        zoomControl: false
      });

      // Dark style tile layer (CartoDB DarkMatter)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          maxZoom: 19
        }
      ).addTo(map);

      // Custom Store Icon (Pizza oven)
      const storeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background: #b91c1c; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 15px rgba(185, 28, 28, 0.8);">🍕</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      // Custom Delivery Icon (Home)
      const homeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background: #15803d; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">🏠</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(storePos, { icon: storeIcon })
        .addTo(map)
        .bindPopup('<b>Pizzeria Bella Notte</b><br>Forno a Lenha')
        .openPopup();

      L.marker(deliveryPos, { icon: homeIcon })
        .addTo(map)
        .bindPopup('<b>Seu Endereço de Entrega</b>');

      // Add connecting dashed route
      L.polyline([storePos, deliveryPos], {
        color: '#f59e0b',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.8
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
    };
  }, []);

  // Update courier marker when position changes via WebSockets
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !courierPos) return;

    const courierIcon = L.divIcon({
      className: 'custom-map-icon courier-pin-pulse',
      html: `<div style="background: #f59e0b; width: 36px; height: 36px; border-radius: 50%; border: 3px solid #18181b; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 20px rgba(245, 158, 11, 1); animation: bounce 1s infinite alternate;">🛵</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (!courierMarkerRef.current) {
      courierMarkerRef.current = L.marker(courierPos, { icon: courierIcon })
        .addTo(map)
        .bindPopup('<b>Motoboy a caminho!</b>')
        .openPopup();
    } else {
      courierMarkerRef.current.setLatLng(courierPos);
    }

    map.panTo(courierPos, { animate: true, duration: 1.5 });
  }, [courierPos]);

  return <div ref={mapContainerRef} className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-stone-800" />;
};
