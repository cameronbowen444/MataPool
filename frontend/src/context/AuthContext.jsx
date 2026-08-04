// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const AuthContext = createContext(null);

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return token
    ? {
        Authorization: `Token ${token}`,
      }
    : {};
}

async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  return response.json().catch(() => ({}));
}

function getErrorMessage(data, fallbackMessage) {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.error) {
    return data.error;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (
    Array.isArray(data.non_field_errors) &&
    data.non_field_errors.length > 0
  ) {
    return data.non_field_errors[0];
  }

  const firstValue = Object.values(data)[0];

  if (Array.isArray(firstValue)) {
    return firstValue[0];
  }

  if (typeof firstValue === "string") {
    return firstValue;
  }

  return fallbackMessage;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("matapoolUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("matapoolUser");
      }
    }

    setLoading(false);
  }, []);

  /*
   * AUTHENTICATION
   */

  const login = async (credentials) => {
    const endpoint = credentials.googleToken
      ? "/auth/google/"
      : "/auth/login/";

    const body = credentials.googleToken
      ? {
          token: credentials.googleToken,
        }
      : {
          email: credentials.email,
          password: credentials.password,
        };

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "Login failed. Please try again.",
        ),
      );
    }

    setUser(data.user);

    localStorage.setItem(
      "matapoolUser",
      JSON.stringify(data.user),
    );

    if (data.token) {
      localStorage.setItem(
        "accessToken",
        data.token,
      );
    }

    if (data.refresh) {
      localStorage.setItem(
        "refreshToken",
        data.refresh,
      );
    }

    return data;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      "matapoolUser",
      JSON.stringify(updatedUser),
    );
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("matapoolUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  /*
   * PROFILES
   */

  const getPublicProfile = async (userId) => {
    const response = await fetch(
      `${API_URL}/profiles/${userId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "We couldn't load this profile.",
        ),
      );
    }

    return data;
  };

  /*
   * EVENTS
   */

  const getEvents = async () => {
    const response = await fetch(
      `${API_URL}/events/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "We couldn't load the events.",
        ),
      );
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  const getEvent = async (eventId) => {
    const response = await fetch(
      `${API_URL}/events/${eventId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "We couldn't load this event.",
        ),
      );
    }

    return data;
  };

  const createEvent = async (eventData) => {
    const body =
      eventData instanceof FormData
        ? eventData
        : createEventFormData(eventData);

    const response = await fetch(
      `${API_URL}/events/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body,
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "We couldn't create the event.",
        ),
      );
    }

    return data;
  };

  const updateEvent = async (
    eventId,
    eventData,
  ) => {
    const body =
      eventData instanceof FormData
        ? eventData
        : createEventFormData(eventData);

    const response = await fetch(
      `${API_URL}/events/${eventId}/`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body,
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "We couldn't update the event.",
        ),
      );
    }

    return data;
  };

  const deleteEvent = async (eventId) => {
    const response = await fetch(
      `${API_URL}/events/${eventId}/`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "We couldn't delete the event.",
        ),
      );
    }

    return true;
  };

  const deleteEventGalleryImage = async (
    imageId,
  ) => {
    const response = await fetch(
      `${API_URL}/events/gallery/${imageId}/`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "We couldn't delete the image.",
        ),
      );
    }

    return true;
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),

    login,
    updateUser,
    logout,

    getPublicProfile,

    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    deleteEventGalleryImage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function createEventFormData(eventData) {
  const body = new FormData();

  if (eventData.title?.trim()) {
    body.append(
      "title",
      eventData.title.trim(),
    );
  }

  if (eventData.description?.trim()) {
    body.append(
      "description",
      eventData.description.trim(),
    );
  }

  if (eventData.location?.trim()) {
    body.append(
      "location",
      eventData.location.trim(),
    );
  }

  if (eventData.date) {
    body.append("date", eventData.date);
  }

  if (eventData.time) {
    body.append("time", eventData.time);
  }

  if (eventData.bannerImage) {
    body.append(
      "banner_image",
      eventData.bannerImage,
    );
  }

  const galleryImages =
    eventData.galleryImages || [];

  galleryImages.forEach((image) => {
    body.append("gallery_images", image);
  });

  return body;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}