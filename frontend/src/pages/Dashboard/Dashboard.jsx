import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Dashboard.module.css";

function Dashboard() {

  const { user } = useAuth();


  return (
    <main className={styles.page}>

      <section className={styles.content}>
        <p className={styles.eyebrow}>Dashboard</p>

        <h1>
          Welcome
          {user?.first_name ? `, ${user.first_name}` : ""}
        </h1>

        <p>
          Your MataPool dashboard is ready for future social,
          event, and carpool features.
        </p>
      </section>
    </main>
  );
}

export default Dashboard;