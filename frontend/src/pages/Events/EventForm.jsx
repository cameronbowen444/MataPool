import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Events.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function EventForm({ initialData = null, isEdit = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
  });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(null);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [newGalleryInputs, setNewGalleryInputs] = useState([{ id: Date.now(), file: null, previewUrl: null }]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        location: initialData.location || "",
        date: initialData.date || "",
        time: initialData.time || "",
      });
      setExistingGalleryImages(initialData.gallery_images || []);
    }
  }, [initialData]);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImageFile(file);
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
      setBannerPreviewUrl(URL.createObjectURL(file));
    }
  };

  const availableSlots = 5 - existingGalleryImages.length;

  const handleGalleryInput = (index, file) => {
    const updatedInputs = [...newGalleryInputs];
    
    if (updatedInputs[index].previewUrl) {
      URL.revokeObjectURL(updatedInputs[index].previewUrl);
    }

    updatedInputs[index].file = file || null;
    updatedInputs[index].previewUrl = file ? URL.createObjectURL(file) : null;
    
    const newFilledCount = updatedInputs.filter(input => input.file).length;
    if (file && index === updatedInputs.length - 1 && newFilledCount < availableSlots) {
       updatedInputs.push({ id: Date.now(), file: null, previewUrl: null });
    }
    setNewGalleryInputs(updatedInputs);
  };

  const removeGalleryInput = (index) => {
    const updated = [...newGalleryInputs];
    if (updated[index].previewUrl) {
      URL.revokeObjectURL(updated[index].previewUrl);
    }
    updated.splice(index, 1);
    
    const hasEmpty = updated.some(input => !input.file);
    if (!hasEmpty && updated.length < availableSlots) {
      updated.push({ id: Date.now(), file: null, previewUrl: null });
    } else if (updated.length === 0 && availableSlots > 0) {
      updated.push({ id: Date.now(), file: null, previewUrl: null });
    }
    
    setNewGalleryInputs(updated);
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm("Delete this photo from the gallery?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/events/gallery/${imageId}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        setExistingGalleryImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        alert("Failed to delete the image.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const url = isEdit 
        ? `${API_URL}/events/${initialData.id}/` 
        : `${API_URL}/events/`;
      const method = isEdit ? "PUT" : "POST";

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) payload.append(key, formData[key]);
      });
      if (bannerImageFile) {
        payload.append("banner_image", bannerImageFile);
      }
      newGalleryInputs.forEach((input) => {
        if (input.file) {
          payload.append("gallery_images", input.file);
        }
      });

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${token}`,
        },
        body: payload,
      });

      if (res.ok) {
        navigate("/events");
      } else {
        const data = await res.json();
        setError(JSON.stringify(data));
      }
    } catch (err) {
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Title</label>
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label>Location</label>
        <input 
          type="text" 
          name="location" 
          value={formData.location} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Time</label>
          <input 
            type="time" 
            name="time" 
            value={formData.time} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          rows="4"
        ></textarea>
      </div>

      <div className="form-group">
        <label>Banner Image</label>
        <div className="banner-input-segment">
          <input 
            type="file" 
            accept="image/*" 
            id="banner-upload"
            style={{ display: 'none' }}
            onChange={handleBannerChange} 
          />
          <label 
            htmlFor="banner-upload"
            className="placeholder-upload-box banner-placeholder"
          >
            {bannerPreviewUrl ? (
              <img src={bannerPreviewUrl} alt="Banner Preview" className="gallery-preview-img" />
            ) : (isEdit && initialData?.banner_image && !bannerImageFile) ? (
              <img src={`${API_URL}${initialData.banner_image}`} alt="Current Banner" className="gallery-preview-img" />
            ) : (
              <div className="placeholder-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Upload Banner</span>
              </div>
            )}
          </label>
        </div>
        {isEdit && initialData?.banner_image && !bannerImageFile && (
          <p className="file-help-text">Select a new image to replace the current banner.</p>
        )}
      </div>

      <div className="form-group">
        <label>Gallery Images (Max 5 total)</label>
        
        {existingGalleryImages.length > 0 && (
          <div className="existing-gallery-edit">
            {existingGalleryImages.map((img) => (
              <div key={img.id} className="gallery-image-wrapper">
                <img src={`${API_URL}${img.image}`} alt="Gallery item" />
                <button 
                  type="button"
                  onClick={() => handleDeleteExistingImage(img.id)} 
                  className="btn-delete-gallery-img"
                  title="Delete this photo"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {availableSlots > 0 ? (
          <div className="new-gallery-inputs">
            {newGalleryInputs.map((input, index) => (
              <div key={input.id} className="gallery-input-segment">
                <input 
                  type="file" 
                  accept="image/*" 
                  id={`gallery-upload-${input.id}`}
                  style={{ display: 'none' }}
                  onChange={(e) => handleGalleryInput(index, e.target.files[0])} 
                />
                
                <label 
                  htmlFor={`gallery-upload-${input.id}`}
                  className="placeholder-upload-box"
                >
                  {input.previewUrl ? (
                    <img src={input.previewUrl} alt="Preview" className="gallery-preview-img" />
                  ) : (
                    <div className="placeholder-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>Add</span>
                    </div>
                  )}
                </label>

                {input.file && (
                  <button 
                    type="button" 
                    className="btn-delete-gallery-img" 
                    onClick={(e) => {
                      e.preventDefault();
                      removeGalleryInput(index);
                    }}
                    title="Remove this photo"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="file-help-text">Maximum of 5 gallery images reached. Delete existing images to add more.</p>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
