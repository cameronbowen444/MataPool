// src/pages/PublicProfile/PublicProfile.jsx

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";

import styles from "./PublicProfile.module.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function authHeaders() {
  const token = localStorage.getItem("accessToken");

  return token
    ? {
        Authorization: `Token ${token}`,
      }
    : {};
}

function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(
          `${API_URL}/profiles/${userId}/`,
          {
            method: "GET",
            headers: authHeaders(),
          },
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.detail ||
              "We couldn't load this profile.",
          );
        }

        if (!cancelled) {
          setProfile(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p
            className={styles.muted}
            role="status"
            aria-live="polite"
          >
            Loading profile…
          </p>
        </section>
      </main>
    );
  }

  if (loadError || !profile) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.error} role="alert">
            {loadError ||
              "This profile could not be found."}
          </p>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft aria-hidden="true" />
            Go Back
          </button>
        </section>
      </main>
    );
  }

  const fullName = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const displayName =
    fullName || "MataPool Member";

  const eventCount =
    profile.event_count ??
    profile.events_created ??
    profile.events?.length ??
    0;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft aria-hidden="true" />
          Back
        </button>

        <div className={styles.profileHeader}>
          {profile.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={
                profile.profile_picture_alt ||
                `${displayName}'s profile picture`
              }
              className={styles.avatar}
            />
          ) : (
            <div
              className={styles.avatarPlaceholder}
              aria-hidden="true"
            >
              <FaUser />
            </div>
          )}

          <div className={styles.profileInfo}>
            <p className={styles.eyebrow}>
              MataPool Member
            </p>

            <h1 className={styles.heading}>
              {displayName}
            </h1>

            {profile.bio ? (
              <p className={styles.bio}>
                {profile.bio}
              </p>
            ) : (
              <p className={styles.muted}>
                This member has not added a bio yet.
              </p>
            )}
          </div>
        </div>

        <div className={styles.activity}>
          <div className={styles.activityItem}>
            <FaCalendarAlt aria-hidden="true" />
            <div>
              <strong>{eventCount}</strong>
              <span>
                {eventCount === 1
                  ? "Event posted"
                  : "Events posted"}
              </span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <FaCalendarAlt aria-hidden="true" />
            <div>
              <strong>{eventCount}</strong>
              <span>
                Carpool pickups
              </span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <FaCalendarAlt aria-hidden="true" />
            <div>
              <strong>{eventCount}</strong>
              <span>
                Carpool Requests
              </span>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

export default PublicProfile;