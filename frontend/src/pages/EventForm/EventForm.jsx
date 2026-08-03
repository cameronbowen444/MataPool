import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaImage,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import styles from "./EventForm.module.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const MAX_GALLERY_IMAGES = 5;

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  date: "",
  time: "",
};

function getMediaUrl(path) {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function EventForm({
  initialData = null,
  isEdit = false,
}) {
  const navigate = useNavigate();

  const {
    createEvent,
    updateEvent,
    deleteEventGalleryImage,
  } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);

  const [bannerImage, setBannerImage] =
    useState(null);

  const [bannerPreview, setBannerPreview] =
    useState("");

  const [existingGallery, setExistingGallery] =
    useState([]);

  const [newGalleryImages, setNewGalleryImages] =
    useState([]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    setForm({
      title: initialData.title || "",
      description: initialData.description || "",
      location: initialData.location || "",
      date: initialData.date || "",
      time: initialData.time
        ? initialData.time.slice(0, 5)
        : "",
    });

    setExistingGallery(
      initialData.gallery_images || []
    );
  }, [initialData]);

  const remainingGallerySlots = useMemo(() => {
    return Math.max(
      0,
      MAX_GALLERY_IMAGES -
        existingGallery.length -
        newGalleryImages.length
    );
  }, [
    existingGallery.length,
    newGalleryImages.length,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerImage(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) return;

    const acceptedFiles = selectedFiles.slice(
      0,
      remainingGallerySlots
    );

    const preparedImages = acceptedFiles.map(
      (file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      })
    );

    setNewGalleryImages((previous) => [
      ...previous,
      ...preparedImages,
    ]);

    event.target.value = "";
  };

  const removeNewGalleryImage = (imageId) => {
    setNewGalleryImages((previous) => {
      const selectedImage = previous.find(
        (image) => image.id === imageId
      );

      if (selectedImage) {
        URL.revokeObjectURL(
          selectedImage.preview
        );
      }

      return previous.filter(
        (image) => image.id !== imageId
      );
    });
  };

  const removeExistingGalleryImage = async (
    imageId
  ) => {
    const confirmed = window.confirm(
      "Delete this gallery image?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteEventGalleryImage(imageId);

      setExistingGallery((previous) =>
        previous.filter(
          (image) => image.id !== imageId
        )
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "We couldn't delete the image."
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const eventData = {
        title: form.title,
        description: form.description,
        location: form.location,
        date: form.date,
        time: form.time,
        bannerImage,
        galleryImages: newGalleryImages.map(
          (image) => image.file
        ),
      };

      const savedEvent = isEdit
        ? await updateEvent(
            initialData.id,
            eventData
          )
        : await createEvent(eventData);

      navigate(`/events/${savedEvent.id}`);
    } catch (requestError) {
      setError(
        requestError.message ||
          "We couldn't save the event."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
    >
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="title"
        >
          Event title
        </label>

        <input
          id="title"
          name="title"
          className={styles.input}
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter an event title"
        />

        <p className={styles.hint}>
          This is the only required field.
        </p>
      </div>

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="location"
        >
          Location{" "}
          <span className={styles.optional}>
            (optional)
          </span>
        </label>

        <input
          id="location"
          name="location"
          className={styles.input}
          type="text"
          value={form.location}
          onChange={handleChange}
          placeholder="Example: CSUN Library"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="date"
          >
            Date{" "}
            <span className={styles.optional}>
              (optional)
            </span>
          </label>

          <input
            id="date"
            name="date"
            className={styles.input}
            type="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="time"
          >
            Time{" "}
            <span className={styles.optional}>
              (optional)
            </span>
          </label>

          <input
            id="time"
            name="time"
            className={styles.input}
            type="time"
            value={form.time}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="description"
        >
          Description{" "}
          <span className={styles.optional}>
            (optional)
          </span>
        </label>

        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          rows={5}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the event"
        />
      </div>

      <section className={styles.uploadSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Banner image</h2>
            <p>Optional main event image.</p>
          </div>
        </div>

        <input
          id="banner-image"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className={styles.hiddenInput}
        />

        <label
          htmlFor="banner-image"
          className={styles.bannerUpload}
        >
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Selected event banner preview"
            />
          ) : initialData?.banner_image ? (
            <img
              src={getMediaUrl(
                initialData.banner_image
              )}
              alt="Current event banner"
            />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <FaImage aria-hidden="true" />
              <span>Select a banner</span>
            </div>
          )}
        </label>
      </section>

      <section className={styles.uploadSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Photo gallery</h2>
            <p>
              Optional. Add up to{" "}
              {MAX_GALLERY_IMAGES} photos.
            </p>
          </div>

          <span className={styles.counter}>
            {existingGallery.length +
              newGalleryImages.length}
            /{MAX_GALLERY_IMAGES}
          </span>
        </div>

        {(existingGallery.length > 0 ||
          newGalleryImages.length > 0) && (
          <div className={styles.galleryGrid}>
            {existingGallery.map((image) => (
              <div
                key={image.id}
                className={styles.galleryItem}
              >
                <img
                  src={getMediaUrl(image.image)}
                  alt="Existing event gallery item"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeExistingGalleryImage(
                      image.id
                    )
                  }
                  aria-label="Delete gallery image"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
            ))}

            {newGalleryImages.map((image) => (
              <div
                key={image.id}
                className={styles.galleryItem}
              >
                <img
                  src={image.preview}
                  alt="Selected gallery preview"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeNewGalleryImage(image.id)
                  }
                  aria-label="Remove selected image"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {remainingGallerySlots > 0 && (
          <>
            <input
              id="gallery-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className={styles.hiddenInput}
            />

            <label
              htmlFor="gallery-images"
              className={styles.galleryUpload}
            >
              <FaPlus aria-hidden="true" />
              Add Gallery Images
            </label>
          </>
        )}
      </section>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={styles.cancelButton}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className={styles.submitButton}
        >
          {saving
            ? "Saving..."
            : isEdit
              ? "Update Event"
              : "Create Event"}
        </button>
      </div>
    </form>
  );
}

export default EventForm;