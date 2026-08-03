import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import EventForm from "../EventForm/EventForm";
import styles from "./EventCreate.module.css";

function EventCreate() {
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

        <header className={styles.header}>
          <p className={styles.eyebrow}>
            MataPool Events
          </p>

          <h1>Create an Event</h1>

          <p className={styles.description}>
            Only the event title is required. You can
            add the other information now or later.
          </p>
        </header>

        <EventForm />
      </section>
    </main>
  );
}

export default EventCreate;