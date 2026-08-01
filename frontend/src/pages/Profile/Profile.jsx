// src/pages/Profile/Profile.jsx

import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import styles from "./Profile.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// The prompt shown under the alt-text field, per the accessibility spec.
const ALT_TEXT_PROMPT =
  "Add a description of the image for blind users of the service.";

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
  profile_picture_alt: "",
};

function Profile() {
  const { updateUser } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [email, setEmail] = useState("");

  // The picture already saved on the server (absolute URL), and a newly
  // chosen file plus its local preview URL before saving.
  const [currentPictureUrl, setCurrentPictureUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
        setCurrentPictureUrl(data.profile_picture || "");
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          profile_picture_alt: data.profile_picture_alt || "",
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

  // Release the object URL when the preview changes or on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      // Multipart so the image file can ride along with the text fields.
      const body = new FormData();
      body.append("first_name", form.first_name);
      body.append("last_name", form.last_name);
      body.append("phone", form.phone);
      body.append("bio", form.bio);
      body.append("profile_picture_alt", form.profile_picture_alt);

      // Only send the image when the user picked a new one, so we don't
      // overwrite the existing picture with an empty value.
      if (selectedFile) {
        body.append("profile_picture", selectedFile);
      }

      const response = await fetch(`${API_URL}/auth/me/`, {
        method: "PATCH",
        // Note: no Content-Type header - the browser sets the multipart
        // boundary automatically for FormData.
        headers: authHeaders(),
        body,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const firstError =
          data.detail ||
          Object.values(data)?.[0]?.[0] ||
          "We couldn't save your changes. Please try again.";
        throw new Error(firstError);
      }

      // Swap in the saved picture URL and clear the pending file/preview.
      setCurrentPictureUrl(data.profile_picture || "");
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }

      updateUser(data);
      setStatus({ type: "success", message: "Your profile has been saved." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const displayPictureUrl = previewUrl || currentPictureUrl;

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
            <fieldset className={styles.pictureFieldset}>
              <legend className={styles.legend}>Profile picture</legend>

              <div className={styles.pictureRow}>
                {displayPictureUrl ? (
                  <img
                    src={displayPictureUrl}
                    alt={form.profile_picture_alt}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder} aria-hidden="true">
                    No photo
                  </div>
                )}

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="profile_picture">
                    Upload a photo
                  </label>
                  <input
                    id="profile_picture"
                    name="profile_picture"
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile_picture_alt">
                  Image description (alt text)
                </label>
                <input
                  id="profile_picture_alt"
                  name="profile_picture_alt"
                  className={styles.input}
                  type="text"
                  value={form.profile_picture_alt}
                  onChange={handleChange}
                  aria-describedby="alt-help"
                />
                <p id="alt-help" className={styles.hint}>
                  {ALT_TEXT_PROMPT}
                </p>
              </div>
            </fieldset>

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
