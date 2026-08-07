import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const center = {
  lat: 34.2405,
  lng: -118.5294 // CSUN
};

function BasicMap({ users = [], onRequestRide, onConfirmPickup }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  if (loadError) return <div>Error loading maps. Check your API key and restrictions.</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
      >
        {/* Render markers for each user fetched from your database */}
        {users.map((user) => {
          if (!user.latitude || !user.longitude) return null;

          const position = {
            lat: parseFloat(user.latitude),
            lng: parseFloat(user.longitude)
          };

          return (
            <MarkerF
              key={user.id}
              position={position}
              onClick={() => setSelectedUser(user)}
              icon={
                user.profile_picture
                  ? {
                      url: user.profile_picture,
                      scaledSize: new window.google.maps.Size(40, 40),
                    }
                  : undefined
              }
            />
          );
        })}

        {/* POP UP when clicking a users profile from map*/}
        {selectedUser && (
          <InfoWindowF
            position={{
              lat: parseFloat(selectedUser.latitude),
              lng: parseFloat(selectedUser.longitude)
            }}
            onCloseClick={() => setSelectedUser(null)}
          >
            <div style={{ textAlign: 'center', padding: '8px', color: '#333' }}>
              <img
                src={selectedUser.profile_picture || 'https://via.placeholder.com/50'}
                alt={selectedUser.username}
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <h4 style={{ margin: '8px 0 4px' }}>{selectedUser.username || selectedUser.first_name}</h4>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#666' }}>
                {selectedUser.is_driver ? '🚗 Driver' : '🙋 Passenger'}
              </p>

              {selectedUser.is_driver ? (
                <button
                  onClick={() => onRequestRide(selectedUser)}
                  style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Request Ride
                </button>
              ) : (
                <button
                  onClick={() => onConfirmPickup(selectedUser)}
                  style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Confirm Pick Up
                </button>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}

export default React.memo(BasicMap);