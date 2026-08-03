import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaLocationArrow,
  FaPlus,
  FaRedo,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import styles from "./EventsList.module.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function getMediaUrl(path) {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatDate(date) {
  if (!date) return "Date not specified";

  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "Time not specified";

  const [hours, minutes] = time.split(":");
  const parsedTime = new Date();

  parsedTime.setHours(Number(hours), Number(minutes));

  return parsedTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function EventsList() {
  const { getEvents } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEvents();

      setEvents(data);
    } catch (requestError) {
      setError(
        requestError.message ||
          "We couldn't load the events."
      );
    } finally {
      setLoading(false);
    }
  }, [getEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              MataPool Community
            </p>

            <h1>Campus Events</h1>

            <p className={styles.subtitle}>
              Discover events created by members of the
              CSUN community.
            </p>
          </div>

          <Link
            to="/events/create"
            className={styles.createButton}
          >
            <FaPlus aria-hidden="true" />
            Create Event
          </Link>
        </header>

        {loading ? (
          <div className={styles.statusCard}>
            <span className={styles.spinner} />
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className={styles.errorCard} role="alert">
            <h2>Unable to load events</h2>
            <p>{error}</p>

            <button
              type="button"
              onClick={loadEvents}
              className={styles.retryButton}
            >
              <FaRedo aria-hidden="true" />
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className={styles.emptyCard}>
            <FaCalendarAlt
              className={styles.emptyIcon}
              aria-hidden="true"
            />

            <h2>No events yet</h2>

            <p>
              Be the first person to create an event.
            </p>

            <Link
              to="/events/create"
              className={styles.emptyButton}
            >
              Create an Event
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {events.map((event) => (
              <article
                key={event.id}
                className={styles.card}
              >
                <div className={styles.imageContainer}>
                  {event.banner_image ? (
                    <img
                      src={getMediaUrl(
                        event.banner_image
                      )}
                      alt={`${event.title} event banner`}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <FaCalendarAlt aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <h2>{event.title}</h2>

                  <div className={styles.meta}>
                    <p>
                      <FaCalendarAlt aria-hidden="true" />
                      {formatDate(event.date)}
                    </p>

                    <p>
                      <FaClock aria-hidden="true" />
                      {formatTime(event.time)}
                    </p>

                    <p>
                      <FaLocationArrow
                        aria-hidden="true"
                      />
                      {event.location ||
                        "Location not specified"}
                    </p>
                  </div>

                  {event.description && (
                    <p className={styles.description}>
                      {event.description}
                    </p>
                  )}

                  <Link
                    to={`/events/${event.id}`}
                    className={styles.detailsButton}
                  >
                    View Event
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default EventsList;