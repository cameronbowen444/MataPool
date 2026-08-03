import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import EventForm from "./EventForm";
import "./Events.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function EventEdit() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setInitialData(data);
        } else {
          setError("Event not found or access denied.");
        }
      } catch (err) {
        setError("Failed to fetch event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p className="events-container">Loading...</p>;
  if (error) return <p className="events-container error">{error}</p>;

  return (
    <div className="events-container">
      <Link to={`/events/${id}`} className="back-link">
        &larr; Back to Event
      </Link>
      <h2>Edit Event: {initialData.title}</h2>
      <EventForm initialData={initialData} isEdit={true} />
    </div>
  );
}
