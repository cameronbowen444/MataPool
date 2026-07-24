import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className={styles.page}>
      <nav className={styles.navbar}>
        <Link to="/dashboard" className={styles.logo}>
          MataPool
        </Link>

        <div className={styles.links}>
          <Link to="/dashboard">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/carpools">Carpools</Link>
          <Link to="/profile">Profile</Link>

          <button type="button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </nav>

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