import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import EventForm from "../EventForm/EventForm";
import styles from "./EventCreate.module.css";

function EventCreate() {
  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <Link to="/events" className={styles.backLink}>
          <FaArrowLeft aria-hidden="true" />
          Back to Events
        </Link>

        <header className={styles.header}>
          <p className={styles.eyebrow}>
            MataPool Events
          </p>

          <h1>Create an Event</h1>

          <p className={styles.description}>
            Share an event with the CSUN community. Only the
            title is required, and you can add more details
            later.
          </p>
        </header>

        <section className={styles.formCard}>
          <EventForm />
        </section>
      </section>
    </main>
  );
}

export default EventCreate;