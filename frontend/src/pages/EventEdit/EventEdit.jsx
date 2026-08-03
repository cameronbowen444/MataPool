import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import EventForm from "../EventForm/EventForm";
import styles from "./EventEdit.module.css";

function EventEdit() {
  const { id } = useParams();
  const { getEvent } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
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
          <div className={styles.statusCard}>
            <span className={styles.spinner} />
            <p>Loading event...</p>
          </div>
        ) : error ? (
          <div
            className={styles.errorCard}
            role="alert"
          >
            <h1>Unable to edit event</h1>
            <p>{error}</p>
          </div>
        ) : event ? (
          <>
            <header className={styles.header}>
              <p className={styles.eyebrow}>
                Edit Event
              </p>

              <h1>{event.title}</h1>

              <p className={styles.description}>
                Change the event information or add
                photos.
              </p>
            </header>

            <EventForm
              initialData={event}
              isEdit
            />
          </>
        ) : null}
      </section>
    </main>
  );
}

export default EventEdit;