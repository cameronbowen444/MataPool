// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("matapoolUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("matapoolUser");
      }
    }

    setLoading(false);
  }, []);

  // Authenticates against the backend. Pass { email, password } for a
  // standard login, or { googleToken } for Google sign-in. Throws on
  // failure so the calling page can show an error.
  const login = async (credentials) => {
    const endpoint = credentials.googleToken
      ? "/auth/google/"
      : "/auth/login/";

    const body = credentials.googleToken
      ? { token: credentials.googleToken }
      : { email: credentials.email, password: credentials.password };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || data.detail || "Login failed. Please try again."
      );
    }

    setUser(data.user);
    localStorage.setItem("matapoolUser", JSON.stringify(data.user));

    if (data.token) {
      localStorage.setItem("accessToken", data.token);
    }

    return data;
  };

  // Replaces the cached user after a profile edit so the UI (navbar,
  // dashboard greeting, etc.) reflects the latest values immediately.
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("matapoolUser", JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("matapoolUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    updateUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}