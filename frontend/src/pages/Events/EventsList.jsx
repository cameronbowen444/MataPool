import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Events.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/events/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Events</h2>
        <Link to="/events/create" className="btn-primary">
          + Create Event
        </Link>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found. Be the first to create one!</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              {event.banner_image && (
                <img 
                  src={`${API_URL}${event.banner_image}`} 
                  alt={event.title} 
                  className="event-card-image"
                />
              )}
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {event.date} at {event.time}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <Link to={`/events/${event.id}`} className="btn-secondary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
