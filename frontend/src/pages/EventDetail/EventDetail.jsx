import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaLocationArrow,
  FaTrash,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import styles from "./EventDetail.module.css";

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

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString([], {
    weekday: "long",
    month: "long",
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

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user,
    getEvent,
    deleteEvent,
  } = useAuth();

  const [event, setEvent] = useState(null);
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const data = await getEvent(id);

        if (!cancelled) {
          setEvent(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "We couldn't load this event."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [getEvent, id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteEvent(id);

      navigate("/events");
    } catch (requestError) {
      setError(
        requestError.message ||
          "We couldn't delete the event."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.statusCard}>
          <span className={styles.spinner} />
          <p>Loading event...</p>
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className={styles.page}>
        <div className={styles.errorCard}>
          <h1>Unable to load event</h1>
          <p>{error}</p>

          <Link to="/events">
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  if (!event) return null;

  const isCreator =
    user?.id === event.creator?.id;

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <Link
          to="/events"
          className={styles.backLink}
        >
          <FaArrowLeft aria-hidden="true" />
          Back to Events
        </Link>

        <article className={styles.card}>
          {event.banner_image && (
            <img
              src={getMediaUrl(
                event.banner_image
              )}
              alt={`${event.title} event banner`}
              className={styles.banner}
            />
          )}

          <div className={styles.content}>
            <div className={styles.headingRow}>
              <div>
                <p className={styles.eyebrow}>
                  MataPool Event
                </p>

                <h1>{event.title}</h1>
              </div>

              {isCreator && (
                <div className={styles.actions}>
                  <Link
                    to={`/events/${id}/edit`}
                    className={styles.editButton}
                  >
                    <FaEdit aria-hidden="true" />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className={styles.deleteButton}
                  >
                    <FaTrash aria-hidden="true" />

                    {deleting
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <p
                className={styles.error}
                role="alert"
              >
                {error}
              </p>
            )}

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

            {event.creator && (
              <p className={styles.organizer}>
                Created by{" "}
                {event.creator.first_name ||
                event.creator.last_name
                  ? `${event.creator.first_name || ""} ${
                      event.creator.last_name || ""
                    }`.trim()
                  : event.creator.email}
              </p>
            )}

            {event.description ? (
              <div className={styles.description}>
                <h2>About this event</h2>
                <p>{event.description}</p>
              </div>
            ) : (
              <p className={styles.muted}>
                No event description was added.
              </p>
            )}

            {event.gallery_images?.length > 0 && (
              <section className={styles.gallery}>
                <h2>Event photos</h2>

                <div className={styles.galleryGrid}>
                  {event.gallery_images.map(
                    (image) => (
                      <button
                        key={image.id}
                        type="button"
                        className={
                          styles.galleryButton
                        }
                        onClick={() =>
                          setSelectedImage(
                            getMediaUrl(image.image)
                          )
                        }
                      >
                        <img
                          src={getMediaUrl(
                            image.image
                          )}
                          alt="Event gallery item"
                        />
                      </button>
                    )
                  )}
                </div>
              </section>
            )}
          </div>
        </article>
      </section>

      {selectedImage && (
        <div
          className={styles.lightbox}
          onClick={() =>
            setSelectedImage(null)
          }
        >
          <button
            type="button"
            className={styles.closeButton}
            onClick={() =>
              setSelectedImage(null)
            }
            aria-label="Close image"
          >
            &times;
          </button>

          <img
            src={selectedImage}
            alt="Expanded event gallery item"
            onClick={(event) =>
              event.stopPropagation()
            }
          />
        </div>
      )}
    </main>
  );
}

export default EventDetail;