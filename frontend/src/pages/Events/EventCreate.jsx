import EventForm from "./EventForm";
import "./Events.css";

export default function EventCreate() {
  return (
    <div className="events-container">
      <h2>Create New Event</h2>
      <EventForm />
    </div>
  );
}
