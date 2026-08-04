import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaRedo,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import EventForm from "../EventForm/EventForm";
import styles from "./EventEdit.module.css";

function EventEdit() {
  const { id } = useParams();
  const { getEvent } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEvent(id);

      setEvent(data);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "We couldn't load this event.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchEvent() {
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
            requestError?.message ||
              "We couldn't load this event.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [getEvent, id]);

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <Link
          to={`/events/${id}`}
          className={styles.backLink}
        >
          <FaArrowLeft aria-hidden="true" />
          Back to Event
        </Link>

        {loading ? (
          <section className={styles.statusCard}>
            <span className={styles.spinner} />

            <div>
              <h1>Loading event</h1>
              <p>Getting the event information.</p>
            </div>
          </section>
        ) : error ? (
          <section
            className={styles.errorCard}
            role="alert"
          >
            <span className={styles.errorIcon}>!</span>

            <div className={styles.errorContent}>
              <h1>Unable to edit event</h1>
              <p>{error}</p>

              <button
                type="button"
                onClick={loadEvent}
                className={styles.retryButton}
              >
                <FaRedo aria-hidden="true" />
                Try Again
              </button>
            </div>
          </section>
        ) : event ? (
          <>
            <header className={styles.header}>
              <p className={styles.eyebrow}>
                MataPool Events
              </p>

              <h1>Edit Event</h1>

              <p className={styles.eventName}>
                {event.title}
              </p>

              <p className={styles.description}>
                Update the event information, banner, or
                gallery photos below.
              </p>
            </header>

            <section className={styles.formCard}>
              <EventForm
                initialData={event}
                isEdit
              />
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}

export default EventEdit;