import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaLocationArrow,
  FaTrash,
  FaUser,
  FaTimes,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import styles from "./EventDetail.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getDateDetails(date) {
  if (!date) {
    return {
      weekday: "Date",
      month: "TBD",
      day: "--",
      year: "",
      fullDate: "Date not specified",
    };
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  return {
    weekday: parsedDate.toLocaleDateString([], {
      weekday: "short",
    }),
    month: parsedDate.toLocaleDateString([], {
      month: "short",
    }),
    day: parsedDate.toLocaleDateString([], {
      day: "numeric",
    }),
    year: parsedDate.toLocaleDateString([], {
      year: "numeric",
    }),
    fullDate: parsedDate.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function formatTime(time) {
  if (!time) {
    return "Time not specified";
  }

  const [hours, minutes] = time.split(":");
  const parsedTime = new Date();

  parsedTime.setHours(Number(hours), Number(minutes), 0, 0);

  return parsedTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getEventStatus(date) {
  if (!date) {
    return "Upcoming";
  }

  const eventDate = new Date(`${date}T23:59:59`);
  const now = new Date();

  return eventDate < now ? "Past Event" : "Upcoming Event";
}

function getCreatorName(creator) {
  if (!creator) {
    return "MataPool community member";
  }

  const fullName = [creator.first_name, creator.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || creator.email || "MataPool community member";
}

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, getEvent, deleteEvent } = useAuth();

  const [event, setEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
          setError(requestError?.message || "We couldn't load this event.");
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

  useEffect(() => {
    if (!selectedImage) {
      return undefined;
    }

    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this event?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteEvent(id);

      navigate("/events");
    } catch (requestError) {
      setError(requestError?.message || "We couldn't delete this event.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.statusCard}>
          <span className={styles.spinner} />

          <div>
            <h1>Loading event</h1>
            <p>Gathering the latest event information.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className={styles.page}>
        <section className={styles.errorCard}>
          <span className={styles.errorIcon}>!</span>

          <div>
            <p className={styles.errorEyebrow}>Event unavailable</p>

            <h1>Unable to load this event</h1>
            <p>{error}</p>

            <Link to="/events" className={styles.errorBackButton}>
              <FaArrowLeft aria-hidden="true" />
              Back to Events
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!event) {
    return null;
  }

  const isCreator = user?.id === event.creator?.id;

  const dateDetails = getDateDetails(event.date);
  const eventStatus = getEventStatus(event.date);
  const creatorName = getCreatorName(event.creator);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundShapeOne} />
      <div className={styles.backgroundShapeTwo} />

      <section className={styles.container}>
        <div className={styles.topNavigation}>
          <Link to="/events" className={styles.backLink}>
            <FaArrowLeft aria-hidden="true" />
            Back to Event Board
          </Link>

          {isCreator && (
            <div className={styles.ownerActions}>
              <Link to={`/events/${id}/edit`} className={styles.editButton}>
                <FaEdit aria-hidden="true" />
                Edit Event
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={styles.deleteButton}
              >
                <FaTrash aria-hidden="true" />

                {deleting ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          )}
        </div>

        {error && event && (
          <div className={styles.inlineError} role="alert">
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        <article className={styles.eventArticle}>
          <section className={styles.hero}>
            <div className={styles.bannerContainer}>
              {event.banner_image ? (
                <img
                  src={getMediaUrl(event.banner_image)}
                  alt={`${event.title} event banner`}
                  className={styles.banner}
                />
              ) : (
                <div className={styles.placeholderBanner}>
                  <FaCalendarAlt aria-hidden="true" />

                  <span>CSUN Community Event</span>
                </div>
              )}

              <div className={styles.bannerOverlay} />

              <span
                className={`${styles.statusBadge} ${
                  eventStatus === "Past Event" ? styles.pastBadge : ""
                }`}
              >
                {eventStatus}
              </span>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.dateCard}>
                <span className={styles.dateWeekday}>
                  {dateDetails.weekday}
                </span>

                <strong>{dateDetails.day}</strong>

                <span className={styles.dateMonth}>{dateDetails.month}</span>

                {dateDetails.year && (
                  <span className={styles.dateYear}>{dateDetails.year}</span>
                )}
              </div>

              <div className={styles.titleContent}>
                <p className={styles.eyebrow}>MataPool Community Event</p>

                <h1>{event.title}</h1>

                <p className={styles.organizerLine}>
                  Posted by{" "}
                  {event.creator?.id ? (
                    <Link
                      to={`/profiles/${event.creator.id}`}
                      className={styles.creatorLink}
                    >
                      {creatorName}
                    </Link>
                  ) : (
                    <strong>{creatorName}</strong>
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className={styles.detailLayout}>
            <div className={styles.mainContent}>
              <section className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <FaCalendarAlt aria-hidden="true" />
                  </span>

                  <div>
                    <p>Date</p>
                    <strong>{dateDetails.fullDate}</strong>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <FaClock aria-hidden="true" />
                  </span>

                  <div>
                    <p>Time</p>
                    <strong>{formatTime(event.time)}</strong>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <FaLocationArrow aria-hidden="true" />
                  </span>

                  <div>
                    <p>Location</p>
                    <strong>
                      {event.location || "Location not specified"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className={styles.descriptionSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className={styles.sectionEyebrow}>Event information</p>

                    <h2>About this event</h2>
                  </div>

                  <div className={styles.headingLine} />
                </div>

                {event.description ? (
                  <p className={styles.description}>{event.description}</p>
                ) : (
                  <div className={styles.emptyDescription}>
                    No event description was added.
                  </div>
                )}
              </section>

              {event.gallery_images?.length > 0 && (
                <section className={styles.gallery}>
                  <div className={styles.sectionHeading}>
                    <div>
                      <p className={styles.sectionEyebrow}>Event media</p>

                      <h2>Event photos</h2>
                    </div>

                    <div className={styles.headingLine} />
                  </div>

                  <div className={styles.galleryGrid}>
                    {event.gallery_images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        className={`${styles.galleryButton} ${
                          index === 0 ? styles.featuredImage : ""
                        }`}
                        onClick={() =>
                          setSelectedImage(getMediaUrl(image.image))
                        }
                        aria-label={`Open event photo ${index + 1}`}
                      >
                        <img
                          src={getMediaUrl(image.image)}
                          alt={`Event gallery item ${index + 1}`}
                        />

                        <span className={styles.galleryOverlay}>
                          View Photo
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className={styles.sidebar}>
              <section className={styles.organizerCard}>
                <p className={styles.sidebarEyebrow}>Posted By:</p>

                <div className={styles.organizerHeader}>
                  <div className={styles.avatar}>
                    <FaUser aria-hidden="true" />
                  </div>

                  <div>
                    {event.creator?.id ? (
                      <Link
                        to={`/profiles/${event.creator.id}`}
                        className={styles.organizerNameLink}
                      >
                        {creatorName}
                      </Link>
                    ) : (
                      <h2>{creatorName}</h2>
                    )}

                    <p>CSUN Student</p>
                  </div>
                </div>
              </section>

              <section className={styles.summaryCard}>
                <p className={styles.sidebarEyebrow}>Event details</p>

                <div className={styles.summaryItem}>
                  <FaCalendarAlt aria-hidden="true" />

                  <span>
                    {dateDetails.month} {dateDetails.day}
                  </span>
                </div>

                <div className={styles.summaryItem}>
                  <FaClock aria-hidden="true" />

                  <span>{formatTime(event.time)}</span>
                </div>

                <div className={styles.summaryItem}>
                  <FaLocationArrow aria-hidden="true" />

                  <span>{event.location || "Location not specified"}</span>
                </div>
              </section>

              <Link to="/events" className={styles.boardButton}>
                <FaArrowLeft aria-hidden="true" />
                Explore More Events
              </Link>
            </aside>
          </section>
        </article>
      </section>

      {selectedImage && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded event photo"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setSelectedImage(null)}
            aria-label="Close expanded image"
          >
            <FaTimes aria-hidden="true" />
          </button>

          <div
            className={styles.lightboxContent}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <img src={selectedImage} alt="Expanded event gallery item" />
          </div>
        </div>
      )}
    </main>
  );
}

export default EventDetail;
