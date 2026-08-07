import React, { useState, useEffect } from 'react';
import BasicMap from '../../components/Map/BasicMap';
import styles from './Carpools.module.css';

export default function Carpools() {
  const [viewMode, setViewMode] = useState('list');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch created accounts from your Django backend
  useEffect(() => {
    fetch('/api/carpool-users/') // Adjust endpoint path to match your Django urls.py
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading carpool users:", err);
        setLoading(false);
      });
  }, []);

  const handleRequestRide = (driver) => {
    // Perform POST request to backend API to create ride request
    alert(`Requested ride from driver: ${driver.username}`);
  };

  const handleConfirmPickup = (passenger) => {
    // Perform POST request to backend API to confirm pickup
    alert(`Confirmed pickup for passenger: ${passenger.username}`);
  };

  if (loading) return <div>Loading carpools...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>MataPool Carpools</h2>
        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.activeBtn : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.activeBtn : ''}`}
            onClick={() => setViewMode('map')}
          >
            🗺️ Map View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className={styles.cardGrid}>
          {users.map((user) => (
            <div key={user.id} className={styles.carpoolCard}>
              <h3>{user.username}</h3>
              <p>Role: {user.is_driver ? '🚗 Driver' : '🙋 Passenger'}</p>
            </div>
          ))}
        </div>
      ) : (
        <BasicMap
          users={users}
          onRequestRide={handleRequestRide}
          onConfirmPickup={handleConfirmPickup}
        />
      )}
    </div>
  );
}