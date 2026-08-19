import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./pages/Login";
import ReportIncident from "./pages/ReportIncident";
import SafetyDashboard from "./pages/SafetyDashboard";
import NotAuthorized from "./pages/NotAuthorized";

function Home() {
  const { role, profile } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h2>ระบบแจ้งเหตุความปลอดภัยโรงเรียน</h2>

      <p>ผู้ใช้: {profile?.displayName || "-"}</p>
      <p>สิทธิ์: {role || "-"}</p>

      <ul>
        <li>
          <Link to="/report">แจ้งเหตุ</Link>
        </li>

        {["safety", "commander", "admin"].includes(role) && (
          <li>
            <Link to="/safety-dashboard">Safety Dashboard</Link>
          </li>
        )}
      </ul>

      <button onClick={() => signOut(auth)}>ออกจากระบบ</button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute
                allowRoles={["student", "teacher", "safety", "commander", "admin"]}
              >
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute
                allowRoles={["student", "teacher", "safety", "commander", "admin"]}
              >
                <ReportIncident />
              </ProtectedRoute>
            }
          />

          <Route
            path="/safety-dashboard"
            element={
              <ProtectedRoute allowRoles={["safety", "commander", "admin"]}>
                <SafetyDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/not-authorized" element={<NotAuthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
