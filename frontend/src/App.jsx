import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import EventsList from "./pages/EventsList/EventsList";
import EventCreate from "./pages/EventCreate/EventCreate";
import EventDetail from "./pages/EventDetail/EventDetail";
import EventEdit from "./pages/EventEdit/EventEdit";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "7821136417-g3lei84v4p00plv2j33o3bd6rvrjehk5.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/create"
          element={
            <ProtectedRoute>
              <EventCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute>
              <EventEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;