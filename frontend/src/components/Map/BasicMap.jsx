import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

// Center on CSUN for the MataPool project!
const center = {
  lat: 34.2405,
  lng: -118.5294
};

function BasicMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  if (loadError) return <div>Error loading maps. Check your API key and restrictions.</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '15px', margin: '20px' }}>
        <h2 style={{ marginBottom: '15px', color: '#333' }}>Jira Verification: Map Successfully Renders!</h2>
        <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        >
        </GoogleMap>
    </div>
  );
}

export default React.memo(BasicMap);
