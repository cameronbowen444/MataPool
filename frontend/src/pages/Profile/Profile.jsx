// src/pages/Profile/Profile.jsx

import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// DRF TokenAuthentication expects "Authorization: Token <key>".
function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Token ${token}` } : {};
}

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  phone: "",
  bio: "",
};

function Profile() {
  const { updateUser } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // status: { type: "success" | "error", message: string } | null
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState("");

  // Fetch the current user's profile on mount.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch(`${API_URL}/auth/me/`, {
          headers: authHeaders(),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail || "We couldn't load your profile. Please try again."
          );
        }

        if (cancelled) return;

        setEmail(data.email || "");
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
        });
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
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/auth/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // DRF returns field errors as { field: [messages] }.
        const firstError =
          data.detail ||
          Object.values(data)?.[0]?.[0] ||
          "We couldn't save your changes. Please try again.";
        throw new Error(firstError);
      }

      // Keep the cached user (navbar, dashboard greeting) in sync.
      updateUser(data);
      setStatus({ type: "success", message: "Your profile has been saved." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Profile</p>
        <h1 className={styles.heading}>Your profile</h1>

        {loading ? (
          <p className={styles.muted} role="status" aria-live="polite">
            Loading your profile…
          </p>
        ) : loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                CSUN email
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                readOnly
                aria-describedby="email-help"
              />
              <p id="email-help" className={styles.hint}>
                Your email is your login and can't be changed here.
              </p>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="first_name">
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  className={styles.input}
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="last_name">
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  className={styles.input}
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                Phone <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                className={styles.input}
                type="tel"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="bio">
                Bio <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                className={styles.textarea}
                rows={4}
                value={form.bio}
                onChange={handleChange}
                aria-describedby="bio-help"
              />
              <p id="bio-help" className={styles.hint}>
                A short note about you for other MataPool riders.
              </p>
            </div>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            {/* Announced to screen readers as soon as it appears. */}
            <div className={styles.statusRegion} role="status" aria-live="polite">
              {status && (
                <p
                  className={
                    status.type === "success" ? styles.success : styles.error
                  }
                >
                  {status.message}
                </p>
              )}
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default Profile;
