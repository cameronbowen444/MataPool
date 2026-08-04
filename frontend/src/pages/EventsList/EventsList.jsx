import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaLocationArrow,
  FaPlus,
  FaRedo,
  FaSearch,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import styles from "./EventsList.module.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function getMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

function formatDate(date) {
  if (!date) {
    return {
      weekday: "Date",
      month: "TBD",
      day: "--",
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

  parsedTime.setHours(
    Number(hours),
    Number(minutes),
    0,
    0,
  );

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
  const today = new Date();

  if (eventDate < today) {
    return "Past Event";
  }

  return "Upcoming";
}

function normalizeSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCreatorName(creator) {
  if (!creator) {
    return "";
  }

  return [
    creator.first_name,
    creator.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getSearchableEventText(event) {
  const dateDetails = formatDate(event.date);
  const formattedTime = formatTime(event.time);
  const status = getEventStatus(event.date);
  const creatorName = getCreatorName(event.creator);

  let numericDate = "";

  if (event.date) {
    const parsedDate = new Date(
      `${event.date}T00:00:00`,
    );

    numericDate = [
      parsedDate.toLocaleDateString(),
      parsedDate.toLocaleDateString("en-US"),
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      parsedDate.getDate(),
    ].join(" ");
  }

  return normalizeSearchValue(
    [
      event.id,
      event.title,
      event.description,
      event.location,

      event.date,
      dateDetails.weekday,
      dateDetails.month,
      dateDetails.day,
      dateDetails.fullDate,
      numericDate,

      event.time,
      formattedTime,

      status,
      creatorName,
      event.creator?.first_name,
      event.creator?.last_name,
      event.creator?.email,

      event.created_at,
      event.updated_at,

      "event",
      "events",
      "csun",
      "campus",
      "community",
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function EventsList() {
  const { getEvents } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] =
    useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEvents();

      const eventList = Array.isArray(data)
        ? data
        : data?.results || [];

      setEvents(eventList);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "We couldn't load the events.",
      );
    } finally {
      setLoading(false);
    }
  }, [getEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    const sortedEvents = [...events].sort(
      (a, b) => {
        if (!a.date) {
          return 1;
        }

        if (!b.date) {
          return -1;
        }

        return (
          new Date(`${a.date}T${a.time || "00:00"}`) -
          new Date(`${b.date}T${b.time || "00:00"}`)
        );
      },
    );

    const normalizedSearch =
      normalizeSearchValue(searchQuery);

    if (!normalizedSearch) {
      return sortedEvents;
    }

    const searchTerms = normalizedSearch
      .split(" ")
      .filter(Boolean);

    return sortedEvents.filter((event) => {
      const searchableText =
        getSearchableEventText(event);

      return searchTerms.every((term) =>
        searchableText.includes(term),
      );
    });
  }, [events, searchQuery]);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundShapeOne} />
      <div className={styles.backgroundShapeTwo} />

      <section className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              MataPool Community Board
            </p>

            <h1>
              Find something happening at CSUN
            </h1>

            <p className={styles.subtitle}>
              Browse student events, campus activities,
              meetups, workshops, and community
              gatherings.
            </p>
          </div>

          <Link
            to="/events/create"
            className={styles.createButton}
          >
            <FaPlus aria-hidden="true" />
            <span>Create Event</span>
          </Link>
        </header>

        {!loading &&
          !error &&
          events.length > 0 && (
            <section
              className={styles.boardToolbar}
            >
              <div
                className={styles.searchWrapper}
              >
                <FaSearch
                  className={styles.searchIcon}
                  aria-hidden="true"
                />

                <input
                  type="search"
                  placeholder="Search by title, keyword, date, time, location, creator..."
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  className={styles.searchInput}
                  aria-label="Search events by title, description, date, time, location, or creator"
                />
              </div>

              <div className={styles.eventCount}>
                <span>
                  {filteredEvents.length}
                </span>

                {filteredEvents.length === 1
                  ? "event found"
                  : "events found"}
              </div>
            </section>
          )}

        {loading ? (
          <section className={styles.statusCard}>
            <span className={styles.spinner} />

            <div>
              <h2>Loading the event board</h2>

              <p>
                Finding the latest events from the
                CSUN community.
              </p>
            </div>
          </section>
        ) : error ? (
          <section
            className={styles.errorCard}
            role="alert"
          >
            <div className={styles.errorIcon}>
              !
            </div>

            <div className={styles.errorContent}>
              <h2>Unable to load events</h2>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={loadEvents}
              className={styles.retryButton}
            >
              <FaRedo aria-hidden="true" />
              Try Again
            </button>
          </section>
        ) : events.length === 0 ? (
          <section className={styles.emptyCard}>
            <div
              className={
                styles.emptyIconWrapper
              }
            >
              <FaCalendarAlt
                className={styles.emptyIcon}
                aria-hidden="true"
              />
            </div>

            <p className={styles.emptyEyebrow}>
              The board is empty
            </p>

            <h2>No events have been posted yet</h2>

            <p>
              Start the community board by sharing
              the first CSUN event.
            </p>

            <Link
              to="/events/create"
              className={styles.emptyButton}
            >
              <FaPlus aria-hidden="true" />
              Create an Event
            </Link>
          </section>
        ) : filteredEvents.length === 0 ? (
          <section className={styles.emptyCard}>
            <div
              className={
                styles.emptyIconWrapper
              }
            >
              <FaSearch
                className={styles.emptyIcon}
                aria-hidden="true"
              />
            </div>

            <p className={styles.emptyEyebrow}>
              Nothing matched
            </p>

            <h2>No events found</h2>

            <p>
              Try another keyword, date, time,
              location, event name, or creator.
            </p>

            <button
              type="button"
              className={
                styles.clearSearchButton
              }
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          </section>
        ) : (
          <section
            className={styles.eventBoard}
            aria-label="Campus events"
          >
            <div className={styles.boardHeading}>
              <div>
                <p
                  className={
                    styles.boardEyebrow
                  }
                >
                  Community postings
                </p>

                <h2>Upcoming Events</h2>
              </div>

              <div className={styles.boardLine} />
            </div>

            <div className={styles.eventFeed}>
              {filteredEvents.map(
                (event, index) => {
                  const eventDate = formatDate(
                    event.date,
                  );

                  const eventStatus =
                    getEventStatus(event.date);

                  return (
                    <article
                      key={event.id}
                      className={`${
                        styles.eventCard
                      } ${
                        index === 0
                          ? styles.featuredCard
                          : ""
                      }`}
                    >
                      <Link
                        to={`/events/${event.id}`}
                        className={
                          styles.imageLink
                        }
                        aria-label={`View ${event.title}`}
                      >
                        <div
                          className={
                            styles.imageContainer
                          }
                        >
                          {event.banner_image ? (
                            <img
                              src={getMediaUrl(
                                event.banner_image,
                              )}
                              alt={`${event.title} event banner`}
                              className={
                                styles.image
                              }
                            />
                          ) : (
                            <div
                              className={
                                styles.placeholder
                              }
                            >
                              <FaCalendarAlt
                                aria-hidden="true"
                              />

                              <span>
                                CSUN Event
                              </span>
                            </div>
                          )}

                          <div
                            className={
                              styles.imageOverlay
                            }
                          />

                          {index === 0 && (
                            <span
                              className={
                                styles.featuredBadge
                              }
                            >
                              Featured
                            </span>
                          )}
                        </div>
                      </Link>

                      <div
                        className={styles.dateBlock}
                      >
                        <span
                          className={
                            styles.dateWeekday
                          }
                        >
                          {eventDate.weekday}
                        </span>

                        <strong>
                          {eventDate.day}
                        </strong>

                        <span
                          className={
                            styles.dateMonth
                          }
                        >
                          {eventDate.month}
                        </span>
                      </div>

                      <div
                        className={
                          styles.cardContent
                        }
                      >
                        <div
                          className={
                            styles.cardTopRow
                          }
                        >
                          <span
                            className={`${
                              styles.statusBadge
                            } ${
                              eventStatus ===
                              "Past Event"
                                ? styles.pastBadge
                                : ""
                            }`}
                          >
                            {eventStatus}
                          </span>
                        </div>

                        <Link
                          to={`/events/${event.id}`}
                          className={
                            styles.titleLink
                          }
                        >
                          <h3>{event.title}</h3>
                        </Link>

                        <div
                          className={
                            styles.metaList
                          }
                        >
                          <div
                            className={
                              styles.metaItem
                            }
                          >
                            <span
                              className={
                                styles.metaIcon
                              }
                            >
                              <FaCalendarAlt
                                aria-hidden="true"
                              />
                            </span>

                            <span>
                              {eventDate.fullDate}
                            </span>
                          </div>

                          <div
                            className={
                              styles.metaItem
                            }
                          >
                            <span
                              className={
                                styles.metaIcon
                              }
                            >
                              <FaClock
                                aria-hidden="true"
                              />
                            </span>

                            <span>
                              {formatTime(
                                event.time,
                              )}
                            </span>
                          </div>

                          <div
                            className={
                              styles.metaItem
                            }
                          >
                            <span
                              className={
                                styles.metaIcon
                              }
                            >
                              <FaLocationArrow
                                aria-hidden="true"
                              />
                            </span>

                            <span>
                              {event.location ||
                                "Location not specified"}
                            </span>
                          </div>
                        </div>

                        {event.description && (
                          <p
                            className={
                              styles.description
                            }
                          >
                            {event.description}
                          </p>
                        )}

                        <div
                          className={
                            styles.cardFooter
                          }
                        >
                          <Link
                            to={`/events/${event.id}`}
                            className={
                              styles.detailsButton
                            }
                          >
                            View Event Details

                            <FaArrowRight
                              aria-hidden="true"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default EventsList;