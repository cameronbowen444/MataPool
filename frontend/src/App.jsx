import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/");

        if (!response.ok) {
          throw new Error("Failed to connect to API");
        }

        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to Django.");
      }
    };

    getMessage();
  }, []);

  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />
      </Routes>
    </>
  );
}

export default App;