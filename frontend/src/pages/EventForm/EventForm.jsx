import {
  useEffect,
  useMemo,
  useState,
} from "react";
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
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;
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

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialData) {
      return;
    }

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
      initialData.gallery_images || [],
    );
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }

      newGalleryImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [bannerPreview, newGalleryImages]);

  const remainingGallerySlots = useMemo(() => {
    return Math.max(
      0,
      MAX_GALLERY_IMAGES -
        existingGallery.length -
        newGalleryImages.length,
    );
  }, [
    existingGallery.length,
    newGalleryImages.length,
  ]);

  const hasExistingBanner =
    Boolean(initialData?.banner_image);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      general: "",
    }));
  };

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        bannerImage:
          "Please select a valid image file.",
      }));

      event.target.value = "";
      return;
    }

    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }

    setBannerImage(file);
    setBannerPreview(URL.createObjectURL(file));

    setErrors((previous) => ({
      ...previous,
      bannerImage: "",
      general: "",
    }));
  };

  const handleGalleryChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || [],
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const validImages = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    const acceptedFiles = validImages.slice(
      0,
      remainingGallerySlots,
    );

    const preparedImages = acceptedFiles.map(
      (file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }),
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
        (image) => image.id === imageId,
      );

      if (selectedImage) {
        URL.revokeObjectURL(
          selectedImage.preview,
        );
      }

      return previous.filter(
        (image) => image.id !== imageId,
      );
    });
  };

  const removeExistingGalleryImage = async (
    imageId,
  ) => {
    const confirmed = window.confirm(
      "Delete this gallery image?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrors((previous) => ({
        ...previous,
        general: "",
      }));

      await deleteEventGalleryImage(imageId);

      setExistingGallery((previous) =>
        previous.filter(
          (image) => image.id !== imageId,
        ),
      );
    } catch (requestError) {
      setErrors((previous) => ({
        ...previous,
        general:
          requestError?.message ||
          "We couldn't delete the image.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title =
        "Please enter an event title.";
    }

    if (!form.location.trim()) {
      newErrors.location =
        "Please enter the event location.";
    }

    if (!form.date) {
      newErrors.date =
        "Please select the event date.";
    }

    if (!form.time) {
      newErrors.time =
        "Please select the event time.";
    }

    if (!form.description.trim()) {
      newErrors.description =
        "Please enter an event description.";
    }

    if (
      !bannerImage &&
      !hasExistingBanner
    ) {
      newErrors.bannerImage =
        "Please add a banner image.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const normalizeBackendErrors = (error) => {
    const data =
      error?.response?.data ||
      error?.data;

    if (!data || typeof data !== "object") {
      return {
        general:
          error?.message ||
          "We couldn't save the event.",
      };
    }

    const backendErrors = {};

    Object.entries(data).forEach(
      ([field, value]) => {
        const message = Array.isArray(value)
          ? value.join(" ")
          : String(value);

        const fieldMap = {
          banner_image: "bannerImage",
          gallery_images: "gallery",
          non_field_errors: "general",
          detail: "general",
          message: "general",
        };

        const mappedField =
          fieldMap[field] || field;

        backendErrors[mappedField] = message;
      },
    );

    return backendErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date,
        time: form.time,
        bannerImage,
        galleryImages: newGalleryImages.map(
          (image) => image.file,
        ),
      };

      const savedEvent = isEdit
        ? await updateEvent(
            initialData.id,
            eventData,
          )
        : await createEvent(eventData);

      navigate(`/events/${savedEvent.id}`);
    } catch (requestError) {
      setErrors(
        normalizeBackendErrors(requestError),
      );
    } finally {
      setSaving(false);
    }
  };

  const getInputClassName = (fieldName) => {
    return `${styles.input} ${
      errors[fieldName]
        ? styles.invalidInput
        : ""
    }`;
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
    >
      {errors.general && (
        <div
          className={styles.error}
          role="alert"
        >
          {errors.general}
        </div>
      )}

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="title"
        >
          Event title
          <span className={styles.required}>
            *
          </span>
        </label>

        <input
          id="title"
          name="title"
          className={getInputClassName(
            "title",
          )}
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter an event title"
          disabled={saving}
          required
          aria-invalid={Boolean(errors.title)}
          aria-describedby={
            errors.title
              ? "title-error"
              : undefined
          }
        />

        {errors.title && (
          <p
            id="title-error"
            className={styles.fieldError}
            role="alert"
          >
            {errors.title}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="location"
        >
          Location
          <span className={styles.required}>
            *
          </span>
        </label>

        <input
          id="location"
          name="location"
          className={getInputClassName(
            "location",
          )}
          type="text"
          value={form.location}
          onChange={handleChange}
          placeholder="Example: CSUN Library"
          disabled={saving}
          required
          aria-invalid={Boolean(
            errors.location,
          )}
          aria-describedby={
            errors.location
              ? "location-error"
              : undefined
          }
        />

        {errors.location && (
          <p
            id="location-error"
            className={styles.fieldError}
            role="alert"
          >
            {errors.location}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="date"
          >
            Date
            <span className={styles.required}>
              *
            </span>
          </label>

          <input
            id="date"
            name="date"
            className={getInputClassName(
              "date",
            )}
            type="date"
            value={form.date}
            onChange={handleChange}
            disabled={saving}
            required
            aria-invalid={Boolean(
              errors.date,
            )}
            aria-describedby={
              errors.date
                ? "date-error"
                : undefined
            }
          />

          {errors.date && (
            <p
              id="date-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.date}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="time"
          >
            Time
            <span className={styles.required}>
              *
            </span>
          </label>

          <input
            id="time"
            name="time"
            className={getInputClassName(
              "time",
            )}
            type="time"
            value={form.time}
            onChange={handleChange}
            disabled={saving}
            required
            aria-invalid={Boolean(
              errors.time,
            )}
            aria-describedby={
              errors.time
                ? "time-error"
                : undefined
            }
          />

          {errors.time && (
            <p
              id="time-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.time}
            </p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label
          className={styles.label}
          htmlFor="description"
        >
          Description
          <span className={styles.required}>
            *
          </span>
        </label>

        <textarea
          id="description"
          name="description"
          className={`${styles.textarea} ${
            errors.description
              ? styles.invalidInput
              : ""
          }`}
          rows={5}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the event"
          disabled={saving}
          required
          aria-invalid={Boolean(
            errors.description,
          )}
          aria-describedby={
            errors.description
              ? "description-error"
              : undefined
          }
        />

        {errors.description && (
          <p
            id="description-error"
            className={styles.fieldError}
            role="alert"
          >
            {errors.description}
          </p>
        )}
      </div>

      <section className={styles.uploadSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>
              Banner image
              <span
                className={styles.required}
              >
                *
              </span>
            </h2>

            <p>
              Add the main image shown on the event
              board.
            </p>
          </div>
        </div>

        <input
          id="banner-image"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className={styles.hiddenInput}
          disabled={saving}
        />

        <label
          htmlFor="banner-image"
          className={`${styles.bannerUpload} ${
            errors.bannerImage
              ? styles.invalidUpload
              : ""
          }`}
        >
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Selected event banner preview"
            />
          ) : initialData?.banner_image ? (
            <img
              src={getMediaUrl(
                initialData.banner_image,
              )}
              alt="Current event banner"
            />
          ) : (
            <div
              className={
                styles.uploadPlaceholder
              }
            >
              <FaImage aria-hidden="true" />
              <span>Select a banner</span>
              <small>
                JPG, PNG, or another image format
              </small>
            </div>
          )}
        </label>

        {errors.bannerImage && (
          <p
            className={styles.fieldError}
            role="alert"
          >
            {errors.bannerImage}
          </p>
        )}
      </section>

      <section className={styles.uploadSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>
              Photo gallery
              <span className={styles.optional}>
                {" "}
                (optional)
              </span>
            </h2>

            <p>
              Add up to {MAX_GALLERY_IMAGES} extra
              event photos.
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
                      image.id,
                    )
                  }
                  disabled={saving}
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
                    removeNewGalleryImage(
                      image.id,
                    )
                  }
                  disabled={saving}
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
              disabled={saving}
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
          disabled={saving}
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