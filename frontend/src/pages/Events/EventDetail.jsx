import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Events.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") setSelectedImageIndex(null);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, event]);

  const handleNextImage = () => {
    if (!event?.gallery_images) return;
    setSelectedImageIndex((prev) => 
      prev === event.gallery_images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (!event?.gallery_images) return;
    setSelectedImageIndex((prev) => 
      prev === 0 ? event.gallery_images.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/events/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        } else {
          setError("Event not found.");
        }
      } catch (err) {
        setError("Failed to fetch event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/events/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (res.ok) {
        navigate("/events");
      } else {
        alert("Failed to delete the event.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

  if (loading) return <p className="events-container">Loading...</p>;
  if (error) return <p className="events-container error">{error}</p>;
  if (!event) return null;

  const isCreator = user && event.creator && user.id === event.creator.id;

  return (
    <div className="events-container">
      <Link to="/events" className="back-link">
        &larr; Back to Events
      </Link>
      
      <div className="event-detail-card">
        {event.banner_image && (
          <img 
            src={`${API_URL}${event.banner_image}`} 
            alt={event.title} 
            className="event-detail-image"
          />
        )}
        <h2>{event.title}</h2>
        <div className="event-meta">
          <p><strong>Date:</strong> {event.date} at {event.time}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Organizer:</strong> {event.creator.first_name} {event.creator.last_name}</p>
        </div>
        
        <div className="event-description">
          <p>{event.description}</p>
        </div>

        {event.gallery_images && event.gallery_images.length > 0 && (
          <div className="event-gallery">
            <h3>Photo Gallery</h3>
            <div className="event-gallery-grid">
              {event.gallery_images.map((img, index) => (
                <div 
                  key={img.id} 
                  className="gallery-image-wrapper clickable"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={`${API_URL}${img.image}`} alt="Gallery item" />
                </div>
              ))}
            </div>
          </div>
        )}

        {isCreator && (
          <div className="event-actions">
            <Link to={`/events/${id}/edit`} className="btn-secondary">
              Edit Event
            </Link>
            <button onClick={handleDelete} className="btn-danger">
              Delete Event
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && event?.gallery_images && (
        <div className="lightbox-overlay" onClick={() => setSelectedImageIndex(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImageIndex(null)}>&times;</button>
          
          {event.gallery_images.length > 1 && (
            <button 
              className="lightbox-nav left" 
              onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            >
              &#10094;
            </button>
          )}
          
          <img 
            src={`${API_URL}${event.gallery_images[selectedImageIndex].image}`} 
            alt="Full screen gallery item" 
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()} 
          />
          
          {event.gallery_images.length > 1 && (
            <button 
              className="lightbox-nav right" 
              onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            >
              &#10095;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
